// Dynamic route: GET/PUT/DELETE /api/simulations/[simulationId]
// Last updated: 2026-01-08 v3
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ simulationId: string }>;
}

// GET /api/simulations/[simulationId] - 詳細取得
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { simulationId } = await params;
    console.log("GET /api/simulations/[simulationId] - simulationId:", simulationId);

    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      console.log("GET /api/simulations/[simulationId] - No user authenticated");
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }
    console.log("GET /api/simulations/[simulationId] - user.id:", user.id);

    // シミュレーション取得
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
    });
    console.log("GET /api/simulations/[simulationId] - simulation found:", !!simulation);

    if (!simulation) {
      // デバッグ: ユーザーのシミュレーション一覧を確認
      const userSimulations = await prisma.simulation.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      console.log("GET /api/simulations/[simulationId] - user's simulation IDs:", userSimulations.map(s => s.id));
      return NextResponse.json(
        { error: "シミュレーションが見つかりません", requestedId: simulationId, availableIds: userSimulations.map(s => s.id) },
        { status: 404 }
      );
    }

    // 所有者確認
    if (simulation.userId !== user.id) {
      return NextResponse.json(
        { error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error("Simulation get error:", error);
    return NextResponse.json(
      { error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT /api/simulations/[simulationId] - 更新
export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { simulationId } = await params;

    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    // シミュレーション取得
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "シミュレーションが見つかりません" },
        { status: 404 }
      );
    }

    // 所有者確認
    if (simulation.userId !== user.id) {
      return NextResponse.json(
        { error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, propertyUrl, imageUrl, inputData, results, cashFlow } = body;

    // 更新
    const updated = await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        ...(name !== undefined && { name }),
        ...(propertyUrl !== undefined && { propertyUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(inputData !== undefined && { inputData }),
        ...(results !== undefined && { results }),
        ...(cashFlow !== undefined && { cashFlow }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("Simulation update error:", error);
    return NextResponse.json(
      { error: "更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/simulations/[simulationId] - 削除
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { simulationId } = await params;

    // 認証チェック
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    // シミュレーション取得
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "シミュレーションが見つかりません" },
        { status: 404 }
      );
    }

    // 所有者確認
    if (simulation.userId !== user.id) {
      return NextResponse.json(
        { error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    // 削除
    await prisma.simulation.delete({
      where: { id: simulationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Simulation delete error:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
