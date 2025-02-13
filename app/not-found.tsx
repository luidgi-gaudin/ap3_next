import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <Card className="w-[350px]">
                <CardContent className="flex flex-col items-center space-y-4">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-center text-sm text-muted-foreground">
                        Oups… la page que vous recherchez n&apos;existe pas.
                    </p>
                    <Link href="/">
                        <Button>Retour à l&apos;accueil</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}