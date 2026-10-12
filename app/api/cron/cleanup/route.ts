import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS_14 = 14 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({
 ok: false }, { status: 401 });
  }

  const expired = await prisma.inquiry.updateMany({
    where: {
      status: { in: ["NEW", "CONTACTED"] },
      pickupAt: { lt: new Date() },
    },
    data: {
      status: "CANCELLED",
      expiredAt: new Date(),
    },
  });

  const cutoff = new Date(Date.now() - DAYS_14);

  try {
    const [inquiries, blocks] = await Promise.all([
      prisma.inquiry.deleteMany({
        where: { returnAt: { lt: cutoff } },
      }),
      prisma.carBlock.deleteMany({
        where: { endAt: { lt: cutoff } },
      }),
    ]);

    console.log(
      `[cron/cleanup] deleted ${inquiries.count} inquiries, ${blocks.count} blocks (returnAt/endAt older than 14 days)`,
    );
    return NextResponse.json({
      expired: expired.count,
      ok: true,
      deletedInquiries: inquiries.count,
      deletedBlocks: blocks.count,
    });
  } catch (err) {
    console.error("[cron/cleanup] failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
