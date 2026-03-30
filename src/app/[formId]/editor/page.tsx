import { getServerSession } from "@/lib/auth/getServerSession";
import { redirect } from "next/navigation";
import { FormEditor } from "@/components/forms/form-editor";

export default async function FormEditorPage(props: {
	params: Promise<{ formId: string }>;
}) {
	const session = await getServerSession();
	if (!session) redirect("/forbidden");

	const { formId } = await props.params;
	return <FormEditor formId={formId} />;
}
