import Link from "next/link";
import Container from "./container";

const footerLinks = [
  {
    title: "Hỗ trợ",
    links: [
      { label: "Liên hệ", href: "#contact" },
      { label: "Chính sách đổi trả", href: "#returns" },
      { label: "Câu hỏi thường gặp", href: "#faq" }
    ]
  },
  {
    title: "Thương hiệu",
    links: [
      { label: "Câu chuyện", href: "#story" },
      { label: "Blog", href: "#blog" },
      { label: "Tuyển dụng", href: "#career" }
    ]
  },
  {
    title: "Kết nối",
    links: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Zalo OA", href: "#zalo" }
    ]
  }
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container className="grid gap-10 py-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-3 text-sm text-gray-600">
          <p className="text-lg font-semibold text-gray-900">Vito Atelier</p>
          <p>
            Thương hiệu thời trang đương đại được thiết kế dành cho những tín đồ yêu sự thanh
            lịch và bền vững.
          </p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Vito. All rights reserved.</p>
        </div>
        {footerLinks.map((group) => (
          <div key={group.title} className="space-y-3 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{group.title}</p>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-gray-900 hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
    </footer>
  );
}
