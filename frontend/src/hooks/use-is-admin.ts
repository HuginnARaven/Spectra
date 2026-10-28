import { useAppSelector } from "@/app/hooks";
import {UserRole} from "@/features/account/types";

export function useIsAdmin() {
    const { user } = useAppSelector((state) => state.account);
    
    return user?.roles?.includes(UserRole.Admin) ?? false;
}