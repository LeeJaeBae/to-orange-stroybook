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

const meta: Meta = {
  title: 'UI/Form',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const formSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  prisonerNumber: z.string().min(1, '수용번호를 입력해 주세요.'),
});

function FormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      prisonerNumber: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    alert(JSON.stringify(values, null, 2));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-[400px]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>수신인 이름</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormDescription>
                교정시설에 수용 중인 분의 실명을 입력해 주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prisonerNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>수용번호</FormLabel>
              <FormControl>
                <Input placeholder="12345" {...field} />
              </FormControl>
              <FormDescription>
                수용번호는 교정시설에서 발급받은 번호입니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">수신인 추가</Button>
      </form>
    </Form>
  );
}

export const Default: Story = {
  render: () => <FormExample />,
};

const errorSchema = z.object({
  content: z.string().min(10, '편지 내용은 최소 10자 이상이어야 합니다.'),
});

function FormWithErrors() {
  const form = useForm<z.infer<typeof errorSchema>>({
    resolver: zodResolver(errorSchema),
    defaultValues: { content: '' },
  });

  function onSubmit(values: z.infer<typeof errorSchema>) {
    alert(JSON.stringify(values, null, 2));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-[400px]">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>편지 내용</FormLabel>
              <FormControl>
                <Input placeholder="편지 내용을 입력해 주세요..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">제출 (유효성 검사 테스트)</Button>
      </form>
    </Form>
  );
}

export const WithValidation: Story = {
  render: () => <FormWithErrors />,
};
