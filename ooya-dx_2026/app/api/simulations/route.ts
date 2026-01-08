import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth/server";

// POST /api/simulations - 新規保存
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

    // サブスク確認（active/trialing のみ保存可能）
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription || !["active", "trialing"].includes(subscription.status)) {
      return NextResponse.json(
        { error: "有料プランへの加入が必要です" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, propertyUrl, imageUrl, inputData, results, cashFlow } = body;

    if (!name || !inputData) {
      return NextResponse.json(
        { error: "名前と入力データは必須です" },
        { status: 400 }
      );
    }

    // シミュレーション保存
    const simulation = await prisma.simulation.create({
      data: {
        userId: user.id,
        name,
        propertyUrl: propertyUrl || null,
        imageUrl: imageUrl || null,
        inputData,
        results: results || null,
        cashFlow: cashFlow || null,
      },
    });

    return NextResponse.json({
      id: simulation.id,
      createdAt: simulation.createdAt,
    });
  } catch (error) {
    console.error("Simulation save error:", error);
    return NextResponse.json(
      { error: "保存に失敗しました" },
      { status: 500 }
    );
  }
}

// GET /api/simulations - 一覧取得
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

    // ユーザーのシミュレーション一覧を取得
    const simulations = await prisma.simulation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        results: true,
      },
    });

    // 一覧用に整形（resultsから概要のみ抽出）
    const formattedSimulations = simulations.map((sim) => {
      const results = sim.results as Record<string, unknown> | null;
      return {
        id: sim.id,
        name: sim.name,
        imageUrl: sim.imageUrl,
        createdAt: sim.createdAt,
        updatedAt: sim.updatedAt,
        summary: results
          ? {
              surfaceYield: results.surfaceYield,
              realYield: results.realYield,
              irr: results.irr,
            }
          : null,
      };
    });

    return NextResponse.json({ simulations: formattedSimulations });
  } catch (error) {
    console.error("Simulation list error:", error);
    return NextResponse.json(
      { error: "一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
