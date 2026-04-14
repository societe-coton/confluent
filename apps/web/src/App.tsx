import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Confluent</h1>
          <p className="text-sm text-muted-foreground">
            Design system token verification
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" placeholder="Enter company name" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Indicators</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2 rounded-full bg-status-active" />
              Active
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2 rounded-full bg-status-pending" />
              Pending
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2 rounded-full bg-status-neutral" />
              Revoked
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
