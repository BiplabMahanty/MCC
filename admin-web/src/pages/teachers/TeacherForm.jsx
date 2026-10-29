import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/Toast';
import { useCreateTeacher, useUpdateTeacher } from '../../hooks/useTeachers';
import { uploadProfileImage } from '../../api/uploads';

export default function TeacherForm({ open, onClose, teacher }) {
  const isEdit = !!teacher;
  const { toast } = useToast();
  const create = useCreateTeacher();
  const update = useUpdateTeacher();

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
    if (teacher) {
      reset({
        name: teacher.name ?? '',
        email: teacher.email ?? '',
        phone: teacher.phone ?? '',
        employeeCode: teacher.employeeCode ?? '',
        qualification: teacher.qualification ?? '',
        experienceYears: teacher.experienceYears ?? '',
        isActive: teacher.isActive ?? true,
      });
      setImagePreview(teacher.profileImage?.url ?? null);
    } else {
      reset({ name: '', email: '', phone: '', employeeCode: '', qualification: '', experienceYears: '', password: '', isActive: true });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [open, teacher]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    try {
      let profileImage = teacher?.profileImage;
      if (imageFile) {
        setUploading(true);
        profileImage = await uploadProfileImage(imageFile);
        setUploading(false);
      }

      const payload = {
        ...values,
        employeeCode: values.employeeCode.toUpperCase(),
        experienceYears: values.experienceYears !== '' ? Number(values.experienceYears) : undefined,
        ...(profileImage && { profileImage }),
      };

      if (isEdit && !values.password) delete payload.password;

      if (isEdit) {
        await update.mutateAsync({ id: teacher._id, data: payload });
        toast.success('Teacher updated successfully.');
      } else {
        await create.mutateAsync(payload);
        toast.success('Teacher created successfully.');
      }
      onClose();
    } catch (err) {
      setUploading(false);
      toast.error(err.response?.data?.message ?? 'Something went wrong.');
    }
  };

  const isActive = watch('isActive');
  const busy = isSubmitting || uploading;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Teacher' : 'Add Teacher'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <div className="space-y-4">

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
            <Input label="Full Name *" placeholder="John Smith" error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
            <Input label="Email *" type="email" placeholder="john@example.com" autoComplete="off" error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
            <Input label="Phone" placeholder="+91 98765 43210"
              {...register('phone')} />
            <Input label="Employee Code *" placeholder="EMP001" error={errors.employeeCode?.message}
              {...register('employeeCode', { required: 'Employee code is required' })} />
            <Input
              label={isEdit ? 'Password (leave blank to keep)' : 'Password *'}
              type="password" placeholder="••••••••" autoComplete="new-password" error={errors.password?.message}
              {...register('password', isEdit ? {} : { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
            <Input label="Qualification" placeholder="M.Sc Mathematics" error={errors.qualification?.message}
              {...register('qualification', { maxLength: { value: 150, message: 'Max 150 characters' } })} />
            <Input label="Experience (years)" type="number" placeholder="5" error={errors.experienceYears?.message}
              {...register('experienceYears', {
                min: { value: 0, message: 'Min 0' },
                max: { value: 80, message: 'Max 80' },
              })} />
          </div>

          <Checkbox label="Active" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} />
        </div>

        <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" loading={busy}>{isEdit ? 'Save Changes' : 'Create Teacher'}</Button>
        </div>
      </form>
    </Modal>
  );
}
