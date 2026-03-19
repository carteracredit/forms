import { getServerSession } from "@/lib/auth/getServerSession";
import { redirect } from "next/navigation";
import { FormDetail } from "@/components/forms/form-detail";

export default async function FormDetailPage(props: {
	params: Promise<{ formId: string }>;
	searchParams: Promise<{ tab?: string }>;
}) {
	const session = await getServerSession();
	if (!session) redirect("/forbidden");

	const [{ formId }, searchParams] = await Promise.all([
		props.params,
		props.searchParams,
	]);

	return (
		<FormDetail
			formId={formId}
			initialTab={
				searchParams.tab === "fieldLibrary" ? "fieldLibrary" : "details"
			}
		/>
	);
}
