import { Account } from '@/resource/types/user';
import { LinkForm } from '@/resource/client/components/form/links/link-form';
import { FormCard } from '../../fields/form';

interface AccountLinksProps {
  account: Account;
  links: NonNullable<Account>['links'];
  className?: string;
}
export function AccountLinks({ account, links, className }: AccountLinksProps) {
  if (!account || !links) return null;

  return (
    <FormCard className={className}>
      <h3 className="font-bold text-sm">Social Media</h3>
      <ul className="divide-y">
        {links?.map(link => {
          // if (!link) return null;
          return (
            <li key={link?.id} className="flex flex-row items-center py-4 gap-4 w-full max-w-full">
              <LinkForm account={account} data={link} />
            </li>
          );
        })}
        <li>
          <LinkForm account={account} data={null} />
        </li>
      </ul>
    </FormCard>
  );
}
