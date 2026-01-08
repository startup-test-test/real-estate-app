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

    // ユーザーのシミュレーション一覧を取得（マイページ表示に必要な全データ）
    const simulations = await prisma.simulation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // マイページ用に整形（旧Supabase形式と互換性を持たせる）
    const formattedSimulations = simulations.map((sim) => {
      const inputData = sim.inputData as Record<string, unknown> | null;
      const results = sim.results as Record<string, unknown> | null;
      const cashFlow = sim.cashFlow as unknown[] | null;
      return {
        id: sim.id,
        // 旧Supabase形式との互換性のため simulation_data として返す
        simulation_data: inputData ? {
          ...inputData,
          propertyImageUrl: sim.imageUrl,
        } : null,
        results: results,
        cash_flow_table: cashFlow,
        created_at: sim.createdAt.toISOString(),
        updated_at: sim.updatedAt.toISOString(),
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
