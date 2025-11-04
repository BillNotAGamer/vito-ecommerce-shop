import Container from "@/components/layout/container";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <div className="pb-24">
      <Container className="space-y-4 pt-10">
        <h1 className="text-2xl font-semibold text-gray-900">Chi tiết đơn hàng {params.id}</h1>
        <p className="text-sm text-gray-600">
          Trang chi tiết đơn hàng đang được phát triển. Vui lòng quay lại sau để xem đầy đủ thông tin.
        </p>
      </Container>
    </div>
  );
}
