import React from 'react';

const FirebaseNotConfigured: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 text-center border-t-8 border-primary">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
          Conecte-se ao Firebase para Começar
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Parece que seu aplicativo ainda não está conectado a um banco de dados na nuvem. Para salvar seus produtos, clientes e imagens online, você precisa configurar o Firebase.
        </p>
        
        <div className="text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-3">Próximos Passos:</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Console do Firebase</a> e crie um projeto (ou use um existente).</li>
                <li>Nas configurações do seu projeto, encontre e copie o objeto de configuração do seu aplicativo da web.</li>
                <li>
                    Abra o arquivo <code className="bg-gray-200 text-red-600 font-mono p-1 rounded">firebase/config.ts</code> no seu editor de código.
                </li>
                <li>Cole o objeto de configuração que você copiou, substituindo o conteúdo de exemplo. Salve o arquivo.</li>
            </ol>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Após salvar a configuração, o aplicativo será recarregado automaticamente e estará pronto para uso.
        </p>
      </div>
    </div>
  );
};

export default FirebaseNotConfigured;
