import { ContentPageView, generateContentMetadata } from "@/components/public/content-page-view";

export const generateMetadata = () => generateContentMetadata("confidentialite");
export default function Page() {
  return <ContentPageView slug="confidentialite" />;
}
