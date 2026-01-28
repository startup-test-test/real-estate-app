import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/cf-simulations/:id - 詳細取得
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: simulationId } = await params;

    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
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

    return NextResponse.json(cfSimulation);
  } catch (error) {
    console.error("CF Simulation get error:", error);
    return NextResponse.json(
      { error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT /api/cf-simulations/:id - 更新
export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: simulationId } = await params;

    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
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

// DELETE /api/cf-simulations/:id - 削除
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: simulationId } = await params;

    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
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
