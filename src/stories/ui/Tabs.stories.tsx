import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="write" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="write">편지 작성</TabsTrigger>
        <TabsTrigger value="sent">보낸 편지</TabsTrigger>
        <TabsTrigger value="draft">임시 저장</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <p className="text-sm text-muted-foreground p-4">새 편지를 작성합니다.</p>
      </TabsContent>
      <TabsContent value="sent">
        <p className="text-sm text-muted-foreground p-4">보낸 편지 목록입니다.</p>
      </TabsContent>
      <TabsContent value="draft">
        <p className="text-sm text-muted-foreground p-4">임시 저장된 편지입니다.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithCards: Story = {
  name: '카드와 함께',
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">계정</TabsTrigger>
        <TabsTrigger value="password">비밀번호</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>계정 정보를 수정하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">이름</Label>
              <Input id="name" defaultValue="홍길동" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">연락처</Label>
              <Input id="phone" defaultValue="010-1234-5678" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>비밀번호를 변경합니다.</CardDescription>
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

export const Disabled: Story = {
  name: '비활성화 탭',
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">활성 탭</TabsTrigger>
        <TabsTrigger value="tab2" disabled>비활성 탭</TabsTrigger>
        <TabsTrigger value="tab3">활성 탭</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm p-4">첫 번째 탭 내용</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm p-4">세 번째 탭 내용</p>
      </TabsContent>
    </Tabs>
  ),
};
