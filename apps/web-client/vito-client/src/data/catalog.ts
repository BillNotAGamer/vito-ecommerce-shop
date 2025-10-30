export type Category = {
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  highlight: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  materials: string[];
  care: string[];
  highlights: string[];
  categorySlug: string;
  colors: string[];
  sizes: string[];
  images: string[];
  tags: string[];
  badges?: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  inventory: {
    status: "in_stock" | "low_stock" | "out_of_stock";
    quantity: number;
  };
  related: string[];
};

export type Review = {
  author: string;
  rating: number;
  title: string;
  date: string;
  body: string;
};

export const categories: Category[] = [
  {
    slug: "nu",
    name: "Bộ sưu tập nữ",
    description: "Trang phục thanh lịch và hiện đại cho nàng thành thị.",
    heroImage:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    highlight: "New arrival"
  },
  {
    slug: "nam",
    name: "Bộ sưu tập nam",
    description: "Phong cách tối giản dành cho quý ông hiện đại.",
    heroImage:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
    highlight: "Bán chạy"
  },
  {
    slug: "phu-kien",
    name: "Phụ kiện",
    description: "Túi xách, kính mát và phụ kiện hoàn thiện outfit.",
    heroImage:
      "https://images.unsplash.com/photo-1516641397556-bf3c03fed1dc?auto=format&fit=crop&w=1200&q=80",
    highlight: "Hot"
  },
  {
    slug: "denim",
    name: "Denim",
    description: "Jeans cao cấp giữ form chuẩn và bền màu.",
    heroImage:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
    highlight: "Essential"
  },
  {
    slug: "the-thao",
    name: "Athleisure",
    description: "Thoải mái vận động mà vẫn giữ phong cách.",
    heroImage:
      "https://images.unsplash.com/photo-1519337911274-0b7c0d0b5dca?auto=format&fit=crop&w=1200&q=80",
    highlight: "Limited"
  },
  {
    slug: "giay-dep",
    name: "Giày dép",
    description: "Sneaker, boots và sandals cho mọi hành trình.",
    heroImage:
      "https://images.unsplash.com/photo-1528701800489-20be3c00c1f5?auto=format&fit=crop&w=1200&q=80",
    highlight: "New"
  }
];

export const products: Product[] = [
  {
    id: "1",
    slug: "vito-linen-midi-dress",
    name: "Đầm linen midi Vito",
    description:
      "Thiết kế cổ vuông phóng khoáng cùng chất liệu linen tự nhiên mang lại sự mát mẻ cả ngày dài.",
    price: 1890000,
    salePrice: 1590000,
    rating: 4.8,
    reviewCount: 128,
    materials: ["100% linen hữu cơ", "Lót cotton mềm"],
    care: ["Giặt tay với nước lạnh", "Ủi ở nhiệt độ thấp"],
    highlights: ["Phom A tôn dáng", "Túi ẩn hai bên", "Khóa kéo lưng"],
    categorySlug: "nu",
    colors: ["Trắng kem", "Hồng phấn", "Xanh olive"],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
    ],
    tags: ["linen", "summer", "dress"],
    badges: ["Giảm 15%"],
    featured: true,
    bestseller: true,
    newArrival: true,
    inventory: { status: "low_stock", quantity: 12 },
    related: ["vito-silk-blouse", "vito-pleated-trousers", "vito-muse-handbag"]
  },
  {
    id: "2",
    slug: "vito-structured-blazer",
    name: "Blazer dáng đứng Vito",
    description:
      "Blazer với đường may tỉ mỉ và cầu vai cấu trúc giúp bạn luôn lịch lãm nơi công sở.",
    price: 2590000,
    rating: 4.6,
    reviewCount: 94,
    materials: ["Poly viscose", "Lót satin"],
    care: ["Giặt khô", "Bảo quản nơi khô ráo"],
    highlights: ["Chống nhăn", "Túi cơi", "Khóa cài hai khuy"],
    categorySlug: "nam",
    colors: ["Đen", "Xám khói"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80"
    ],
    tags: ["suit", "office"],
    badges: ["Best seller"],
    featured: true,
    bestseller: true,
    inventory: { status: "in_stock", quantity: 48 },
    related: ["vito-oxford-shirt", "vito-modern-trousers", "vito-weekender-bag"]
  },
  {
    id: "3",
    slug: "vito-muse-handbag",
    name: "Túi xách Muse",
    description:
      "Chiếc túi bucket da thuộc mềm với chi tiết kim loại vàng mờ sang trọng.",
    price: 3190000,
    rating: 4.9,
    reviewCount: 201,
    materials: ["Da bò thuộc thảo mộc", "Lót microfiber"],
    care: ["Lau nhẹ bằng khăn mềm", "Tránh tiếp xúc nước"],
    highlights: ["Dây đeo đa năng", "Ngăn phụ kéo khóa"],
    categorySlug: "phu-kien",
    colors: ["Nâu cognac", "Đen tuyền"],
    sizes: ["One size"],
    images: [
      "https://images.unsplash.com/photo-1516641397556-bf3c03fed1dc?auto=format&fit=crop&w=900&q=80"
    ],
    tags: ["bag", "leather"],
    badges: ["Hàng độc quyền"],
    bestseller: true,
    inventory: { status: "in_stock", quantity: 67 },
    related: ["vito-linen-midi-dress", "vito-silk-blouse", "vito-atelier-scarf"]
  },
  {
    id: "4",
    slug: "vito-airflex-sneaker",
    name: "Sneaker AirFlex",
    description:
      "Đôi sneaker nhẹ, thông thoáng với đế cao su tái chế đàn hồi cao.",
    price: 2290000,
    salePrice: 1990000,
    rating: 4.5,
    reviewCount: 72,
    materials: ["Lưới kỹ thuật", "Đế EVA", "Lớp lót bamboo"],
    care: ["Lau bề mặt", "Phơi nơi khô thoáng"],
    highlights: ["Thấm hút mồ hôi", "Đế chống trượt"],
    categorySlug: "giay-dep",
    colors: ["Trắng", "Xám", "Xanh"],
    sizes: ["38", "39", "40", "41", "42", "43"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80"
    ],
    tags: ["sneaker", "comfort"],
    badges: ["-13%"],
    newArrival: true,
    inventory: { status: "in_stock", quantity: 120 },
    related: ["vito-tech-jogger", "vito-urban-hoodie", "vito-elite-socks"]
  },
  {
    id: "5",
    slug: "vito-silk-blouse",
    name: "Áo blouse lụa",
    description:
      "Áo blouse lụa mềm mại với cổ nơ duyên dáng cho mọi buổi hẹn.",
    price: 1690000,
    rating: 4.7,
    reviewCount: 88,
    materials: ["Lụa satin", "Khóa pearl"],
    care: ["Giặt tay nhẹ", "Phơi nơi râm mát"],
    highlights: ["Cổ nơ tháo rời", "Tay phồng nhẹ"],
    categorySlug: "nu",
    colors: ["Trắng", "Hồng dusty", "Xanh trời"],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
    ],
    tags: ["blouse", "office"],
    featured: true,
    inventory: { status: "in_stock", quantity: 35 },
    related: ["vito-pleated-trousers", "vito-muse-handbag", "vito-atelier-scarf"]
  },
  {
    id: "6",
    slug: "vito-tech-jogger",
    name: "Quần jogger Tech",
    description:
      "Chất liệu co giãn 4 chiều và công nghệ kháng khuẩn giúp bạn vận động thoải mái.",
    price: 1490000,
    rating: 4.3,
    reviewCount: 61,
    materials: ["Polyamide tái chế", "Spandex"],
    care: ["Giặt máy chế độ nhẹ", "Không sử dụng chất tẩy"],
    highlights: ["Co giãn 4 chiều", "Khô nhanh"],
    categorySlug: "the-thao",
    colors: ["Đen", "Xanh navy"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80"
    ],
    tags: ["athleisure"],
    newArrival: true,
    inventory: { status: "low_stock", quantity: 20 },
    related: ["vito-airflex-sneaker", "vito-urban-hoodie", "vito-studio-cap"]
  },
  {
    id: "7",
    slug: "vito-pleated-trousers",
    name: "Quần tây ly lịch lãm",
    description:
      "Quần tây ly chuẩn form với chất liệu cao cấp giữ nếp hoàn hảo.",
    price: 1890000,
    rating: 4.4,
    reviewCount: 45,
    materials: ["Wool pha viscose"],
    care: ["Giặt khô"],
    highlights: ["Ôm hông, ống suông", "Đai điều chỉnh"],
    categorySlug: "nam",
    colors: ["Đen", "Xám"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80"
    ],
    tags: ["tailored"],
    inventory: { status: "in_stock", quantity: 54 },
    related: ["vito-structured-blazer", "vito-oxford-shirt", "vito-airflex-sneaker"]
  }
];

export const productReviews: Record<string, Review[]> = {
  "vito-linen-midi-dress": [
    {
      author: "Lan Anh",
      rating: 5,
      title: "Rất mát và tôn dáng",
      date: "12/03/2024",
      body: "Mình cao 1m65 mặc size S vừa vặn, chất linen thoáng và không nhăn nhiều."
    },
    {
      author: "Thu Hà",
      rating: 4,
      title: "Màu rất xinh",
      date: "02/02/2024",
      body: "Màu olive ngoài đời đẹp hơn hình, mong có thêm size XL."
    }
  ],
  "vito-structured-blazer": [
    {
      author: "Minh Khôi",
      rating: 5,
      title: "Đáng tiền",
      date: "28/01/2024",
      body: "Blazer lên form chuẩn, chất dày dặn và ít nhăn."
    }
  ],
  "vito-airflex-sneaker": [
    {
      author: "Trọng Nghĩa",
      rating: 4,
      title: "Đi êm chân",
      date: "15/02/2024",
      body: "Đế rất êm, hơi lệch nửa size nên chọn lớn hơn một chút."
    }
  ]
};

export const shippingMethods = [
  {
    id: "standard",
    name: "Giao hàng tiêu chuẩn",
    description: "3-5 ngày, miễn phí cho đơn từ 1.000.000đ",
    price: 0
  },
  {
    id: "express",
    name: "Giao nhanh",
    description: "Giao trong 24-48h tại nội thành",
    price: 45000
  }
] as const;

export const paymentMethods = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)"
  },
  {
    id: "bank-card",
    name: "Thẻ ngân hàng nội địa/ quốc tế"
  },
  {
    id: "e-wallet",
    name: "Ví điện tử (Momo, ZaloPay, ShopeePay)"
  },
  {
    id: "qr",
    name: "QR Pay qua ứng dụng ngân hàng"
  }
] as const;

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((product) => product.categorySlug === categorySlug);
}

export function searchProducts(keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return [] as Product[];
  }

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.description,
      ...product.tags,
      ...product.highlights
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getFacetsForCategory(categorySlug: string) {
  const categoryProducts = getProductsByCategory(categorySlug);
  const colors = new Set<string>();
  const sizes = new Set<string>();
  const materials = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  categoryProducts.forEach((product) => {
    product.colors.forEach((color) => colors.add(color));
    product.sizes.forEach((size) => sizes.add(size));
    product.materials.forEach((material) => materials.add(material));
    const effectivePrice = product.salePrice ?? product.price;
    minPrice = Math.min(minPrice, effectivePrice);
    maxPrice = Math.max(maxPrice, effectivePrice);
  });

  return {
    colors: Array.from(colors),
    sizes: Array.from(sizes),
    materials: Array.from(materials),
    priceRange:
      categoryProducts.length > 0
        ? {
            min: minPrice,
            max: maxPrice
          }
        : undefined
  };
}

export const loyaltyTiers = [
  {
    name: "Đồng",
    threshold: 0,
    perks: ["Tích điểm 2%", "Ưu đãi sinh nhật"]
  },
  {
    name: "Bạc",
    threshold: 10000000,
    perks: ["Tích điểm 4%", "Freeship 2 đơn/tháng", "Ưu tiên lịch hẹn thử đồ"]
  },
  {
    name: "Vàng",
    threshold: 20000000,
    perks: ["Tích điểm 7%", "Stylist riêng", "Sự kiện độc quyền"]
  }
] as const;

export const mockOrders = [
  {
    id: "DH-240215-01",
    date: "15/02/2024",
    status: "Đang giao",
    total: 3180000,
    items: [
      { productSlug: "vito-linen-midi-dress", quantity: 1, price: 1590000 },
      { productSlug: "vito-muse-handbag", quantity: 1, price: 1590000 }
    ]
  },
  {
    id: "DH-231220-08",
    date: "20/12/2023",
    status: "Hoàn tất",
    total: 2590000,
    items: [{ productSlug: "vito-structured-blazer", quantity: 1, price: 2590000 }]
  }
] as const;
