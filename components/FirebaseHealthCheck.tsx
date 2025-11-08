import React, { useState } from 'react';
import { checkFirestoreConnection } from '../services/dataService';
import RefreshIcon from './icons/RefreshIcon';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

type CheckStatus = 'idle' | 'checking' | 'success' | 'error';

const StatusDisplay: React.FC<{ status: CheckStatus; error: string | null; serviceName: string }> = ({ status, error, serviceName }) => {
    let cause = null;
    if (error) {
        const lowerError = error.toLowerCase();
        if (lowerError.includes('permission-denied') || lowerError.includes('insufficient permissions')) {
            cause = 'Causa provável: Regras de Segurança. Siga as instruções para corrigir.';
        } else if (lowerError.includes('failed to fetch') || lowerError.includes('firestore/unavailable')) {
             cause = 'Causa provável: O Firestore não foi ativado ou há um problema de rede. Siga as instruções para corrigir.';
        }
    }


    const renderContent = () => {
        switch (status) {
            case 'checking':
                return (
                    <>
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-semibold text-gray-700">{serviceName}:</span>
                        <span className="text-sm text-gray-500">Verificando...</span>
                    </>
                );
            case 'success':
                return (
                    <>
                        <div className="w-5 h-5 flex items-center justify-center text-white bg-green-500 rounded-full"><CheckIcon /></div>
                        <span className="font-semibold text-gray-700">{serviceName}:</span>
                        <span className="text-sm font-semibold text-green-600">Sucesso! Conexão OK.</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <div className="w-5 h-5 flex items-center justify-center text-white bg-red-500 rounded-full"><XIcon /></div>
                        <span className="font-semibold text-gray-700">{serviceName}:</span>
                        <span className="text-sm font-semibold text-red-600">Falhou!</span>
                    </>
                );
            default:
                return null;
        }
    };
    
    return (
        <div>
            <div className="flex items-center gap-3">
                {renderContent()}
            </div>
            {error && (
                <div className="text-xs text-red-700 bg-red-50 p-2 mt-2 rounded-md">
                    {cause && (
                        <p className="font-bold mb-1">{cause}</p>
                    )}
                    <p className="font-mono break-all">{error}</p>
                </div>
            )}
        </div>
    );
};


const FirebaseHealthCheck: React.FC = () => {
    const [firestoreStatus, setFirestoreStatus] = useState<CheckStatus>('idle');
    const [firestoreError, setFirestoreError] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheck = async () => {
        setIsChecking(true);
        setFirestoreStatus('checking');
        setFirestoreError(null);

        // Check Firestore
        try {
            await checkFirestoreConnection();
            setFirestoreStatus('success');
        } catch (error: any) {
            setFirestoreStatus('error');
            setFirestoreError(error.message || 'Um erro desconhecido ocorreu.');
        }

        setIsChecking(false);
    };

    const showResults = firestoreStatus !== 'idle';
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Verificação de Conexão Firebase</h3>
              <p className="text-sm text-gray-600 mt-1 max-w-xl">
                Se estiver com problemas para salvar, clique no botão para testar se o aplicativo tem permissão para acessar o banco de dados.
              </p>
            </div>
            <button
                onClick={handleCheck}
                disabled={isChecking}
                className="flex-shrink-0 bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-wait w-full sm:w-auto"
            >
                {isChecking ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                    </>
                ) : (
                    <>
                        <RefreshIcon />
                        Verificar Agora
                    </>
                )}
            </button>
          </div>

          {showResults && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <StatusDisplay status={firestoreStatus} error={firestoreError} serviceName="Banco de Dados (Firestore)" />
            </div>
          )}
        </div>
    );
};

export default FirebaseHealthCheck;