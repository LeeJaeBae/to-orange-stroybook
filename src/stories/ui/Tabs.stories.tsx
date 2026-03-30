import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">계정</TabsTrigger>
        <TabsTrigger value="password">비밀번호</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>계정</CardTitle>
            <CardDescription>
              계정 정보를 수정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">이름</Label>
              <Input id="name" defaultValue="홍길동" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" defaultValue="hong@example.com" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>비밀번호</CardTitle>
            <CardDescription>
              비밀번호를 변경하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">현재 비밀번호</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">새 비밀번호</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const LetterTabs: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-full max-w-xl">
      <TabsList>
        <TabsTrigger value="all">전체</TabsTrigger>
        <TabsTrigger value="draft">초안</TabsTrigger>
        <TabsTrigger value="sent">발송됨</TabsTrigger>
        <TabsTrigger value="cancelled">취소됨</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-muted-foreground mt-4">모든 편지 목록</p>
      </TabsContent>
      <TabsContent value="draft">
        <p className="text-sm text-muted-foreground mt-4">작성 중인 편지 목록</p>
      </TabsContent>
      <TabsContent value="sent">
        <p className="text-sm text-muted-foreground mt-4">발송된 편지 목록</p>
      </TabsContent>
      <TabsContent value="cancelled">
        <p className="text-sm text-muted-foreground mt-4">취소된 편지 목록</p>
      </TabsContent>
    </Tabs>
  ),
};
