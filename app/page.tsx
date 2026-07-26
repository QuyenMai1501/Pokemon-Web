import { auth } from "@/auth";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pokémon Web</h1>
        <p className={styles.greeting}>
          Chào mừng, Trainer{" "}
          <span className={styles.username}>{session.user.name}</span>!
        </p>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>Team Builder</div>
        <div className={styles.card}>Battle Arena</div>
        <div className={styles.card}>Pokédex</div>
      </div>
    </div>
  );
}
