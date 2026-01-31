import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";

export function LoginForm() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const userData = {
        email: email,
        password: password,
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(userData);
        setEmail("");
        setPassword("");
    }

    return (
        <Dialog>
            <form onSubmit={handleSubmit} id="loginFrom">
                <DialogTrigger asChild>
                    <Button variant="outline">Sign in</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Login</DialogTitle>
                        <DialogDescription>
                            Login to your profile here
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="email-1">Email</Label>
                            <Input id="email-1" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password-1">Password</Label>
                            <Input id="password-1" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="loginFrom">Sign in</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
