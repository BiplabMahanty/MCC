import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/Toast';
import { useCreateStudent, useUpdateStudent } from '../../hooks/useStudents';
import { uploadProfileImage } from '../../api/uploads';
import client from '../../api/client';

function useBatches() {
  return useQuery({
    queryKey: ['batches-select'],
    queryFn: () => client.get('/admin/batches', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

export default function StudentForm({ open, onClose, student }) {
  const isEdit = !!student;
  const { toast } = useToast();
  const create = useCreateStudent();
  const update = useUpdateStudent();
  const { data: batchesData } = useBatches();
  const batches = batchesData ?? [];

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { isActive: true } });

  useEffect(() => {
    if (!open) return;
    if (student) {
      reset({
        name: student.name ?? '',
        email: student.email ?? '',
        phone: student.phone ?? '',
        studentCode: student.studentCode ?? '',
        batchId: student.batchId?._id ?? student.batchId ?? '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
        guardianName: student.guardianName ?? '',
        guardianPhone: student.guardianPhone ?? '',
        isActive: student.isActive ?? true,
      });
      setImagePreview(student.profileImage?.url ?? null);
    } else {
      reset({ name: '', email: '', phone: '', studentCode: '', batchId: '', dateOfBirth: '', guardianName: '', guardianPhone: '', password: '', isActive: true });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [open, student]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    try {
      let profileImage = student?.profileImage;

      if (imageFile) {
        setUploading(true);
        profileImage = await uploadProfileImage(imageFile);
        setUploading(false);
      }

      const payload = {
        ...values,
        studentCode: values.studentCode.toUpperCase(),
        batchId: values.batchId || null,
        dateOfBirth: values.dateOfBirth || null,
        ...(profileImage && { profileImage }),
      };

      if (isEdit) {
        if (!values.password) delete payload.password;
        await update.mutateAsync({ id: student._id, data: payload });
        toast.success('Student updated successfully.');
      } else {
        await create.mutateAsync(payload);
        toast.success('Student created successfully.');
      }
      onClose();
    } catch (err) {
      setUploading(false);
      toast.error(err.response?.data?.message ?? 'Something went wrong.');
    }
  };

  const batchOptions = batches.map((b) => ({ value: b._id, label: `${b.name} (${b.code})` }));
  const isActive = watch('isActive');
  const busy = isSubmitting || uploading;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Student' : 'Add Student'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <div className="space-y-4">

          {/* Profile image */}
          <div className="flex items-center gap-4">
            <Avatar name={watch('name')} src={imagePreview} size="lg" />
            <div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />
              <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current.click()}>
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <p className="text-xs text-text-muted mt-1">PNG, JPG, WEBP · max 5 MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name *" placeholder="Alice Johnson" error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
            <Input label="Email *" type="email" placeholder="alice@example.com" autoComplete="off" error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
            <Input label="Phone" placeholder="+91 98765 43210"
              {...register('phone')} />
            <Input label="Student Code *" placeholder="STU001" error={errors.studentCode?.message}
              {...register('studentCode', { required: 'Student code is required' })} />
            <Input
              label={isEdit ? 'Password (leave blank to keep)' : 'Password *'}
              type="password" placeholder="••••••••" autoComplete="new-password" error={errors.password?.message}
              {...register('password', isEdit ? {} : { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
            <Select label="Batch" options={batchOptions} placeholder="No batch assigned"
              {...register('batchId')} />
            <Input label="Date of Birth" type="date"
              {...register('dateOfBirth')} />
            <Input label="Guardian Name" placeholder="Parent / Guardian"
              {...register('guardianName')} />
            <Input label="Guardian Phone" placeholder="+91 98765 43210"
              {...register('guardianPhone')} />
          </div>

          <Checkbox label="Active" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} />
        </div>

        <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" loading={busy}>{isEdit ? 'Save Changes' : 'Create Student'}</Button>
        </div>
      </form>
    </Modal>
  );
}
