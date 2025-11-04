import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/layout/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface NormalizedOrder {
  id: string;
  status: string;
  createdAt: string | null;
  totalAmount: number | null;
}

interface FetchOrdersResult {
  orders: NormalizedOrder[];
  hasError: boolean;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default async function OrdersPage() {
  const { orders, hasError } = await fetchOrders();

  return (
    <div className="pb-24">
      <Container className="space-y-8 pt-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-gray-900">Đơn hàng của tôi</h1>
          <p className="text-sm text-gray-600">
            Theo dõi trạng thái đơn hàng và xem lại chi tiết các giao dịch đã thực hiện tại Vito Atelier.
          </p>
        </div>

        {hasError ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-10 text-center text-sm text-red-700">
              Không thể tải danh sách đơn hàng ngay lúc này. Vui lòng thử lại sau.
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="border-gray-200 bg-white">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <CardTitle className="text-lg font-semibold text-gray-900">Bạn chưa có đơn hàng nào</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Khi hoàn tất mua sắm, đơn hàng của bạn sẽ hiển thị tại đây để tiện theo dõi.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">Lịch sử đơn hàng</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Nhấp vào nút xem để mở chi tiết từng đơn hàng.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="pl-6">Mã đơn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead className="text-right pr-6">Tổng tiền</TableHead>
                    <TableHead className="text-right pr-6">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer transition hover:bg-gray-50"
                    >
                      <TableCell className="pl-6 font-medium text-gray-900">{order.id}</TableCell>
                      <TableCell className="text-gray-600">{order.status}</TableCell>
                      <TableCell className="text-gray-600">{formatOrderDate(order.createdAt)}</TableCell>
                      <TableCell className="pr-6 text-right font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Link
                          href={`/account/orders/${encodeURIComponent(order.id)}`}
                          className="text-sm font-semibold text-gray-900 transition hover:text-gray-600"
                        >
                          Xem
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
}

async function fetchOrders(): Promise<FetchOrdersResult> {
  let response: Response;

  try {
    response = await fetch("/api/proxy/account/orders", {
      cache: "no-store",
      credentials: "include",
    });
  } catch (error) {
    return { orders: [], hasError: true };
  }

  if (response.status === 401) {
    redirect("/login");
  }

  if (response.status === 204) {
    return { orders: [], hasError: false };
  }

  if (!response.ok) {
    return { orders: [], hasError: true };
  }

  const payload = await safeJson(response);
  const orders = parseOrdersPayload(payload);

  return { orders, hasError: false };
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function parseOrdersPayload(payload: unknown): NormalizedOrder[] {
  const source = extractOrdersArray(payload);
  const normalized = source
    .map((item) => normalizeOrder(item))
    .filter((order): order is NormalizedOrder => order !== null);

  return normalized;
}

function extractOrdersArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const candidateKeys = ["orders", "items", "data", "results", "content", "list", "records"] as const;

    for (const key of candidateKeys) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  return [];
}

function normalizeOrder(order: unknown): NormalizedOrder | null {
  if (!order || typeof order !== "object") {
    return null;
  }

  const record = order as Record<string, unknown>;

  const id = pickString(record, ["id", "code", "orderCode", "orderId", "orderNumber", "reference", "uuid"]);
  if (!id) {
    return null;
  }

  const status =
    pickString(record, ["status", "orderStatus", "state", "progress", "currentStatus"]) ?? "Không xác định";

  const createdAt =
    pickString(record, ["createdAt", "orderDate", "orderedAt", "created_at", "date", "placedAt", "updatedAt"]) ??
    null;

  const total = pickNumber(record, ["total", "totalAmount", "totalPrice", "total_value", "amount", "grandTotal"]);

  return {
    id,
    status,
    createdAt,
    totalAmount: total,
  };
}

function pickString(record: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
    if (typeof value === "number" && !Number.isNaN(value)) {
      return String(value);
    }
  }

  return null;
}

function pickNumber(record: Record<string, unknown>, keys: readonly string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function formatCurrency(amount: number | null) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "—";
  }

  return currencyFormatter.format(amount);
}

function formatOrderDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
