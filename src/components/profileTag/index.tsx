import { cn } from '@lib/utils';
interface ProfileTagProps {
  avatarUrl: string;
  name: string;
  role?: string;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  roleClassName?: string;
}

function ProfileTag({
  avatarUrl,
  name,
  role,
  className,
  avatarClassName,
  nameClassName,
  roleClassName
}: ProfileTagProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <img src={avatarUrl} alt={name} className={cn('w-10 h-10 rounded-full object-cover', avatarClassName)} />
      <div>
        <a className={cn('font-semibold ', nameClassName)}>{name}</a>
        {role && <p className={cn('text-sm text-primary-neutral-500', roleClassName)}>{role}</p>}
      </div>
    </div>
  );
}

export default ProfileTag;
