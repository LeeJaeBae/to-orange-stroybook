import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast, Toaster } from '@/components/ui/sonner';

const meta = {
  title: 'UI/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'React Hook Form + Zod 기반의 폼 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

const senderSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  address: z.string().min(5, '주소를 5자 이상 입력해주세요.'),
});

function SenderFormDemo() {
  const form = useForm<z.infer<typeof senderSchema>>({
    resolver: zodResolver(senderSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
    },
  });

  function onSubmit(values: z.infer<typeof senderSchema>) {
    toast.success(`발신자 정보가 저장되었습니다: ${values.name}`);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[400px]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormDescription>편지에 표시될 발신자 이름입니다.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input placeholder="hong@example.com" {...field} />
                </FormControl>
                <FormDescription>발송 알림을 받을 이메일 주소입니다.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주소</FormLabel>
                <FormControl>
                  <Input placeholder="서울시 강남구 역삼동 123" {...field} />
                </FormControl>
                <FormDescription>편지에 표시될 발신자 주소입니다.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">저장</Button>
        </form>
      </Form>
      <Toaster />
    </>
  );
}

export const Default: Story = {
  render: () => <SenderFormDemo />,
};

const letterSchema = z.object({
  recipient: z.string().min(1, '수신자를 입력해주세요.'),
  content: z.string().min(10, '편지 내용은 10자 이상이어야 합니다.').max(2000, '편지 내용은 2000자 이내여야 합니다.'),
});

function LetterFormDemo() {
  const form = useForm<z.infer<typeof letterSchema>>({
    resolver: zodResolver(letterSchema),
    defaultValues: {
      recipient: '',
      content: '',
    },
  });

  function onSubmit(values: z.infer<typeof letterSchema>) {
    toast.success(`편지가 저장되었습니다. 수신자: ${values.recipient}`);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[400px]">
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>수신자</FormLabel>
                <FormControl>
                  <Input placeholder="수신자 이름" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>편지 내용</FormLabel>
                <FormControl>
                  <Textarea placeholder="마음을 담아 편지를 작성해주세요..." className="min-h-[150px]" {...field} />
                </FormControl>
                <FormDescription>{field.value.length}/2000자</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">임시 저장</Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>초기화</Button>
          </div>
        </form>
      </Form>
      <Toaster />
    </>
  );
}

export const LetterForm: Story = {
  name: '편지 작성 폼',
  render: () => <LetterFormDemo />,
};

function ValidationDemo() {
  const schema = z.object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="space-y-4 w-[300px]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">제출 (빈 값으로 시도)</Button>
      </form>
    </Form>
  );
}

export const WithValidation: Story = {
  name: '유효성 검사',
  render: () => <ValidationDemo />,
};
