import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth/server";

// POST /api/cf-simulations - 新規保存
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, inputData, results, cashFlowTable, status } = body;

    if (!name || !inputData) {
      return NextResponse.json(
        { error: "名前と入力データは必須です" },
        { status: 400 }
      );
    }

    // CFシミュレーション保存
    const cfSimulation = await prisma.cFSimulation.create({
      data: {
        userId: user.id,
        name,
        inputData,
        results: results || null,
        cashFlowTable: cashFlowTable || null,
        status: status || "draft",
      },
    });

    return NextResponse.json({
      id: cfSimulation.id,
      createdAt: cfSimulation.createdAt,
    });
  } catch (error) {
    console.error("CF Simulation save error:", error);
    return NextResponse.json(
      { error: "保存に失敗しました" },
      { status: 500 }
    );
  }
}

// GET /api/cf-simulations - 一覧取得
export async function GET(): Promise<NextResponse> {
  try {
    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    // ユーザーのCFシミュレーション一覧を取得
    const cfSimulations = await prisma.cFSimulation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ simulations: cfSimulations });
  } catch (error) {
    console.error("CF Simulation list error:", error);
    return NextResponse.json(
      { error: "一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
