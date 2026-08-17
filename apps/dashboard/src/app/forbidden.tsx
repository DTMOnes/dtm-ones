import { redirect } from "next/navigation";

export default function Forbidden() {
  redirect("/contacts");
}
