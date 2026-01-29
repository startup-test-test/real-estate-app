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
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { error: "保存に失敗しました", details: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/cf-simulations - 一覧取得 or GET /api/cf-simulations?id=xxx - 詳細取得
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    // URLからidパラメータを取得
    const { searchParams } = new URL(request.url);
    const simulationId = searchParams.get("id");

    // idがある場合は詳細取得
    if (simulationId) {
      const cfSimulation = await prisma.cFSimulation.findUnique({
        where: { id: simulationId },
      });

      if (!cfSimulation) {
        return NextResponse.json(
          { error: "シミュレーションが見つかりません" },
          { status: 404 }
        );
      }

      // 所有者確認
      if (cfSimulation.userId !== user.id) {
        return NextResponse.json(
          { error: "アクセス権限がありません" },
          { status: 403 }
        );
      }

      return NextResponse.json(cfSimulation);
    }

    // idがない場合は一覧取得
    const cfSimulations = await prisma.cFSimulation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ simulations: cfSimulations });
  } catch (error) {
    console.error("CF Simulation get error:", error);
    return NextResponse.json(
      { error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT /api/cf-simulations?id=xxx - 更新
export async function PUT(request: Request): Promise<NextResponse> {
  try {
    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    // URLからidパラメータを取得
    const { searchParams } = new URL(request.url);
    const simulationId = searchParams.get("id");

    if (!simulationId) {
      return NextResponse.json(
        { error: "シミュレーションIDが必要です" },
        { status: 400 }
      );
    }

    // CFシミュレーション取得
    const cfSimulation = await prisma.cFSimulation.findUnique({
      where: { id: simulationId },
    });

    if (!cfSimulation) {
      return NextResponse.json(
        { error: "シミュレーションが見つかりません" },
        { status: 404 }
      );
    }

    // 所有者確認
    if (cfSimulation.userId !== user.id) {
      return NextResponse.json(
        { error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, inputData, results, cashFlowTable, status } = body;

    // 更新
    const updated = await prisma.cFSimulation.update({
      where: { id: simulationId },
      data: {
        ...(name !== undefined && { name }),
        ...(inputData !== undefined && { inputData }),
        ...(results !== undefined && { results }),
        ...(cashFlowTable !== undefined && { cashFlowTable }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("CF Simulation update error:", error);
    return NextResponse.json(
      { error: "更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/cf-simulations?id=xxx - 削除
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    // URLからidパラメータを取得
    const { searchParams } = new URL(request.url);
    const simulationId = searchParams.get("id");

    if (!simulationId) {
      return NextResponse.json(
        { error: "シミュレーションIDが必要です" },
        { status: 400 }
      );
    }

    // CFシミュレーション取得
    const cfSimulation = await prisma.cFSimulation.findUnique({
      where: { id: simulationId },
    });

    if (!cfSimulation) {
      return NextResponse.json(
        { error: "シミュレーションが見つかりません" },
        { status: 404 }
      );
    }

    // 所有者確認
    if (cfSimulation.userId !== user.id) {
      return NextResponse.json(
        { error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    // 削除
    await prisma.cFSimulation.delete({
      where: { id: simulationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CF Simulation delete error:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
