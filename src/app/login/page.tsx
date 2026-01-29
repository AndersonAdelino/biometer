import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string; message?: string }
}) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">BioMeter Access</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your biological status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {searchParams.error && (
                            <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded">{searchParams.error}</p>
                        )}
                        {searchParams.message && (
                            <p className="text-sm font-medium text-green-500 bg-green-500/10 p-2 rounded">{searchParams.message}</p>
                        )}
                        <div className="flex gap-2 pt-2">
                            <Button formAction={login} className="flex-1">Log In</Button>
                            <Button formAction={signup} variant="outline" className="flex-1">Sign Up</Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-center w-full text-muted-foreground">
                        By accessing BioMeter, you agree to track your status responsibly.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
