import { getServerSession } from "@/lib/auth/getServerSession";
import { redirect } from "next/navigation";
import { FormsHomeView } from "@/views/FormsHomeView";

export default async function Home() {
	const session = await getServerSession();

	// Redirect to auth if not authenticated
	if (!session) {
		redirect("/forbidden");
	}

	return <FormsHomeView />;
}
