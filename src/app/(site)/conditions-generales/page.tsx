import { ContentPageView, generateContentMetadata } from "@/components/public/content-page-view";

export const generateMetadata = () => generateContentMetadata("conditions-generales");
export default function Page() {
  return <ContentPageView slug="conditions-generales" />;
}
