import React from 'react';
import { User } from '../types';
import TrashIcon from './icons/TrashIcon';
import CheckIcon from './icons/CheckIcon';

interface UserManagementProps {
  users: User[];
  onDeleteUser: (whatsapp: string) => void;
  onApproveUser: (whatsapp: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onDeleteUser, onApproveUser }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg">Nenhum cliente cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.whatsapp} className="p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-600">{user.whatsapp}</p>
              <span className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                  {user.status === 'approved' ? 'Aprovado' : 'Pendente'}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {user.status === 'pending' && (
                  <button
                    onClick={() => onApproveUser(user.whatsapp)}
                    className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                    aria-label={`Aprovar cliente ${user.name}`}
                  >
                    <CheckIcon />
                  </button>
              )}
              <button
                onClick={() => onDeleteUser(user.whatsapp)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                aria-label={`Remover cliente ${user.name}`}
              >
                <TrashIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;