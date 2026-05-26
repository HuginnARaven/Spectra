import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkIcon, BarChart3, Shield, Zap } from "lucide-react";
import {useAppSelector} from "@/app/hooks.ts";
import { Link } from "react-router-dom"
import {TemporaryUrlForm} from "@/features/urls/components/temporary-url-form.tsx";

export default function HomePage() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/50">
                    <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">
                        <Badge variant="secondary" className="px-3 py-1 text-sm rounded-full">
                            ✨ Spectra is now in public beta
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
                            Short Links, <span className="text-primary">Big Impact.</span>
                        </h1>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl">
                            Transform your long URLs into powerful, trackable short links. Gain valuable insights into your audience with our comprehensive analytics platform.
                        </p>
                        <div className="w-full max-w-sm space-y-2">
                            <TemporaryUrlForm/>
                            <p className="text-xs text-muted-foreground">
                                By clicking Shorten, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </section>
                <section className="w-full py-20 md:py-32">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Everything you need</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl">
                                Spectra isn't just a URL shortener. It's a complete link management platform designed to help you understand and grow your audience.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="border-none shadow-sm bg-muted/30">
                                <CardHeader>
                                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                        <Zap className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>Lightning Fast</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Our globally distributed infrastructure ensures your links redirect instantly, no matter where your users are.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-muted/30">
                                <CardHeader>
                                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                        <BarChart3 className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>Advanced Analytics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Track clicks, referrers, device types, and geographic locations in real-time with our intuitive dashboard.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-muted/30">
                                <CardHeader>
                                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                        <Shield className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>Secure & Reliable</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Every link is protected with advanced encryption. We guarantee 99.9% uptime for all your crucial redirects.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
                <section className="w-full py-20 bg-primary text-primary-foreground">
                    <div className="container px-4 md:px-6 mx-auto text-center">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center space-y-2">
                                <h3 className="text-4xl font-bold">10M+</h3>
                                <p className="text-primary-foreground/80 font-medium">Links Shortened</p>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <h3 className="text-4xl font-bold">500M+</h3>
                                <p className="text-primary-foreground/80 font-medium">Clicks Tracked</p>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <h3 className="text-4xl font-bold">99.9%</h3>
                                <p className="text-primary-foreground/80 font-medium">Uptime SLA</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-20 md:py-32">
                    <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-center space-y-8 text-center">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Ready to boost your links?</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl">
                            Join thousands of creators and businesses who use Spectra to manage and analyze their links.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {!isAuthenticated ? 
                                <Button size="lg" className="px-8">
                                    Get Started for Free
                                </Button>
                                :
                                <Link to={"url-management"}>
                                    <Button size="lg" className="px-8">
                                        Get Started
                                    </Button>
                                </Link>
                            }
                            <Button size="lg" variant="outline" className="px-8">
                                View Documentation
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="w-full py-6 border-t bg-background">
                <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 font-bold">
                        <LinkIcon className="h-5 w-5" />
                        <span>Spectra</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Spectra Inc. All rights reserved.
                    </p>
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                        <a href="#" className="hover:underline">Terms</a>
                        <a href="#" className="hover:underline">Privacy</a>
                        <a href="#" className="hover:underline">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
