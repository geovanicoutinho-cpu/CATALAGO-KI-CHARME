import React, { useState } from 'react';
import { firebaseConfig } from '../firebase/config';
import XIcon from './icons/XIcon';
import WarningIcon from './icons/WarningIcon';
import CopyIcon from './icons/CopyIcon';
import LinkIcon from './icons/LinkIcon';
import CheckIcon from './icons/CheckIcon';
import DatabaseIcon from './icons/DatabaseIcon';

interface FirebaseRulesInstructionsProps {
  onDismiss: () => void;
}

const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita em toda a coleção de produtos
    match /products/{productId} {
      allow read, write: if true;
    }
    // Permite leitura e escrita em toda a coleção de usuários
    match /users/{userId} {
      allow read, write: if true;
    }
    // Permite leitura e escrita no documento de configuração
    match /config/{configId} {
        allow read, write: if true;
    }
    // Permite o teste de saúde da conexão
    match /health_checks/{checkId} {
      allow read, write: if true;
    }
  }
}`;

const FirebaseRulesInstructions: React.FC<FirebaseRulesInstructionsProps> = ({ onDismiss }) => {
  const [copied, setCopied] = useState(false);
  
  const { projectId } = firebaseConfig;
  const firestoreActivationUrl = `https://console.firebase.google.com/project/${projectId}/firestore`;
  const firestoreRulesUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Falha ao copiar texto: ', err);
      alert('Não foi possível copiar o código. Por favor, copie manualmente.');
    });
  };

  const Step: React.FC<{ number: number, children: React.ReactNode }> = ({ number, children }) => (
      <div className="flex items-start gap-3">
          <span className="flex-shrink-0 bg-yellow-400 text-yellow-900 font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">{number}</span>
          <div className="flex flex-col gap-2">{children}</div>
      </div>
  );

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-4 rounded-md shadow-lg mb-8 animate-fade-in" role="alert">
      <div className="flex">
        <div className="py-1">
          <WarningIcon />
        </div>
        <div className="ml-3 flex-grow">
          <p className="font-bold text-lg">Ação Necessária: Configure o Banco de Dados</p>
          <p className="text-sm mt-1">
            Para que o aplicativo possa salvar os dados dos produtos, você precisa ativar o serviço <strong>Firestore</strong> e configurar as regras de permissão no seu painel do Firebase.
          </p>
          
          <div className="mt-4 p-4 bg-white/60 rounded-lg border border-yellow-200">
            <div className="space-y-4 text-sm text-gray-800 animate-fade-in">
                <Step number={1}>
                    <p className="font-bold">Ative o serviço Firestore:</p>
                    <p>Clique no botão abaixo para abrir o Firebase. Se o banco de dados ainda não foi criado, clique em <strong>"Criar banco de dados"</strong>, escolha o modo de <strong>produção</strong> e complete a configuração.</p>
                     <a href={firestoreActivationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                        <LinkIcon />
                        Ativar Banco de Dados
                    </a>
                </Step>
                 <Step number={2}>
                    <p className="font-bold">Configure as regras de segurança:</p>
                    <p>Após ativar, vá para a aba <strong>"Regras"</strong> (ou use o link direto abaixo), copie o código e cole no editor, substituindo todo o conteúdo existente. Clique em <strong>"Publicar"</strong>.</p>
                     <a href={firestoreRulesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                        <LinkIcon />
                        Abrir Regras do Firestore
                    </a>
                     <div className="relative mt-2">
                        <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-x-auto">
                            <code>{firestoreRules}</code>
                        </pre>
                        <button onClick={() => handleCopy(firestoreRules)} className={`absolute top-2 right-2 flex items-center gap-2 text-xs font-semibold py-1 px-2 rounded-md transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`}>
                            {copied ? <CheckIcon /> : <CopyIcon />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </Step>
            </div>
             <p className="font-semibold text-xs mt-4 text-gray-700">
              <strong>Nota:</strong> Estas regras são para desenvolvimento e permitem acesso público. Para um aplicativo em produção, você deve implementar regras de segurança mais restritas.
            </p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button onClick={onDismiss} className="-mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-100 inline-flex h-8 w-8" aria-label="Dispensar">
            <span className="sr-only">Dispensar</span>
            <XIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseRulesInstructions;