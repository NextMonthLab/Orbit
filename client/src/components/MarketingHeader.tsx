import GlobalNav from "./GlobalNav";

export default function MarketingHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <GlobalNav context="marketing" />
    </div>
  );
}
