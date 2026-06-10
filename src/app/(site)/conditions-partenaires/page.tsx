import { ContentPageView, generateContentMetadata } from "@/components/public/content-page-view";

export const generateMetadata = () => generateContentMetadata("conditions-partenaires");
export default function Page() {
  return <ContentPageView slug="conditions-partenaires" />;
}
