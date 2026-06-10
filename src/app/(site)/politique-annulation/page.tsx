import { ContentPageView, generateContentMetadata } from "@/components/public/content-page-view";

export const generateMetadata = () => generateContentMetadata("politique-annulation");
export default function Page() {
  return <ContentPageView slug="politique-annulation" />;
}
