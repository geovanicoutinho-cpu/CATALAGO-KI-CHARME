import React from 'react';
import XIcon from './icons/XIcon';
import InfoIcon from './icons/InfoIcon';

interface AdminNotificationProps {
  onDismiss: () => void;
}

const AdminNotification: React.FC<AdminNotificationProps> = ({ onDismiss }) => {
  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-md mb-6 animate-fade-in" role="alert">
      <div className="flex">
        <div className="py-1">
          <InfoIcon />
        </div>
        <div className="ml-3 flex-grow">
          <p className="font-bold">Próximo Passo: Sincronização na Nuvem</p>
          <p className="text-sm mt-1">
            O aplicativo foi preparado para sincronização! Para que as alterações apareçam em outros dispositivos (celular, computador, etc.), um desenvolvedor precisa conectar o app a um serviço de backend, como o <strong>Firebase do Google</strong>.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button onClick={onDismiss} className="-mx-1.5 -my-1.5 bg-blue-100 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 inline-flex h-8 w-8" aria-label="Dispensar">
            <span className="sr-only">Dispensar</span>
            <XIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotification;
