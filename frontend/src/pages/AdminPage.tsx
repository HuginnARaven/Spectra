import { useParams, Navigate } from "react-router-dom";

export default function AdminPage() {
    const { section } = useParams<{ section: string }>();

    const renderSection = () => {
        switch (section) {
            case "users":
                return "<UsersManagementTab />";
            case "urls":
                return "<UrlsManagementTab />";
            case "subscription-plans":
                return "<PlansManagementTab />";
            default:
                return <Navigate to="/admin/users" replace />;
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {renderSection()}
        </div>
    );
}