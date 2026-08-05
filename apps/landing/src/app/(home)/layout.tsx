// Queries
import { listPublicRosterCategories } from "@/lib/roster/queries";

// Styles
import styles from "./layout.module.scss";

// Components
import Logo from "@/components/Header/Logo";
import Search from "@/components/Header/Search";
import Menu from "@/components/Header/Menu";
import Filters from "@/components/Header/Filters";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await listPublicRosterCategories();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.top_container}>
          <Logo />
          <Search />
          <Menu />
        </div>
        <div>
          <Filters categories={categories} />
        </div>
      </header>

      {children}
    </>
  );
}
