import { ContentPageView, generateContentMetadata } from "@/components/public/content-page-view";

export const generateMetadata = () => generateContentMetadata("mentions-legales");
export default function Page() {
  return <ContentPageView slug="mentions-legales" />;
}
