import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { IconUserCircle } from "@tabler/icons-react"
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field.tsx";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group.tsx";
import { EyeOffIcon, EyeIcon } from "lucide-react";

export function AccountEditForm() {
    const [hidePasswords, setHidePasswords] = useState(true);
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="flex items-center gap-2">
                    <IconUserCircle/>
                    Account
                </div>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">Username</Label>
                        <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-username">Email</Label>
                        <Input id="sheet-demo-username" type="email" defaultValue="duarte@test.com" />
                    </div>
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Password change form</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="flex flex-col gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="password"
                                                type={hidePasswords ? "password" : "text"}
                                                placeholder="Enter new password"
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupButton type="button" size="icon-xs" className="ml-auto" onClick={() => setHidePasswords(!hidePasswords)}>
                                                    {hidePasswords ? <EyeOffIcon /> : <EyeIcon />}
                                                </InputGroupButton>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FieldDescription>
                                            Must be at least 6 characters long.
                                        </FieldDescription>
                                    </Field>
                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm Password
                                    </FieldLabel>
                                    <Input
                                        id="confirmPassword"
                                        type={hidePasswords ? "password" : "text"}
                                        placeholder="Enter password one more time"
                                        required
                                    />
                                    <FieldDescription>
                                        Please confirm your new password.
                                    </FieldDescription>
                                </Field>
                            </form>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button type="submit" className="w-full">
                                Change password
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <SheetFooter>
                    <Button type="submit">Save changes</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
