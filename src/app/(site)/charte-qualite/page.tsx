import { ContentPageView, generateContentMetadata } from "@/components/public/content-page-view";

export const generateMetadata = () => generateContentMetadata("charte-qualite");
export default function Page() {
  return <ContentPageView slug="charte-qualite" />;
}
