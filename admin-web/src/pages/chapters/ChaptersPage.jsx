import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useChapters, useCreateChapter, useUpdateChapter, useDeleteChapter } from '../../hooks/useAcademic';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import client from '../../api/client';

function useSubjects() {
  return useQuery({ queryKey: ['subjects-select'], queryFn: () => client.get('/admin/subjects', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data), staleTime: 60_000 });
}

export default function ChaptersPage() {
  const { toast } = useToast();
  const { data: subjects = [] } = useSubjects();
  const [subjectId, setSubjectId] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { data, isLoading } = useChapters({ page: 1, limit: 100, ...(subjectId && { subjectId }) });
  const create = useCreateChapter();
  const update = useUpdateChapter();
  const remove = useDeleteChapter();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({ defaultValues: { isActive: true, sortOrder: 0 } });

  useEffect(() => {
    if (editing) reset({ name: editing.name, code: editing.code || '', subjectId: editing.subjectId?._id || editing.subjectId, description: editing.description || '', sortOrder: editing.sortOrder || 0, isActive: editing.isActive });
    else reset({ name: '', code: '', subjectId: subjectId || '', description: '', sortOrder: 0, isActive: true });
  }, [editing, open, subjectId, reset]);

  const submit = async (values) => {
    try {
      if (editing) await update.mutateAsync({ id: editing._id, data: { ...values, sortOrder: Number(values.sortOrder) } });
      else await create.mutateAsync({ ...values, sortOrder: Number(values.sortOrder) });
      toast.success('Chapter saved.'); setOpen(false); setEditing(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not save chapter.'); }
  };
  const confirmDelete = async () => { try { await remove.mutateAsync(deleting._id); toast.success('Chapter deleted.'); setDeleting(null); } catch (err) { toast.error(err.response?.data?.message || 'Delete failed.'); } };
  const chapters = data?.data || [];
  const subjectOptions = [{ value: '', label: 'All Subjects' }, ...subjects.map((s) => ({ value: s._id, label: s.name }))];

  return <div className="space-y-4">
    <div className="flex items-center gap-3"><select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-3 text-sm"><option value="">All Subjects</option>{subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select><Button className="ml-auto" size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={16} /> Add Chapter</Button></div>
    <Table loading={isLoading} data={chapters} columns={[{ header: 'Chapter', accessorKey: 'name' }, { header: 'Code', accessorKey: 'code' }, { header: 'Subject', accessorKey: 'subjectId', cell: (v) => v?.name || '—' }, { header: 'Order', accessorKey: 'sortOrder' }, { header: 'Actions', accessorKey: '_id', cell: (_, row) => <div className="flex gap-2"><button onClick={() => { setEditing(row); setOpen(true); }}><Pencil size={14} /></button><button onClick={() => setDeleting(row)}><Trash2 size={14} /></button></div> }]} />
    <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Chapter' : 'Add Chapter'}><form onSubmit={handleSubmit(submit)} className="space-y-4"><Input label="Chapter name *" error={errors.name?.message} {...register('name', { required: 'Name is required' })} /><Input label="Code" {...register('code')} /><Select label="Subject *" options={subjectOptions.slice(1)} {...register('subjectId', { required: 'Subject is required' })} /><Input label="Order" type="number" {...register('sortOrder')} /><Input label="Description" {...register('description')} /><Checkbox label="Active" checked={watch('isActive')} onChange={(e) => setValue('isActive', e.target.checked)} /><div className="flex justify-end"><Button type="submit">Save Chapter</Button></div></form></Modal>
    <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Chapter" confirm confirmLabel="Delete" confirmVariant="danger" onConfirm={confirmDelete}><p className="text-sm">Delete <strong>{deleting?.name}</strong>?</p></Modal>
  </div>;
}
