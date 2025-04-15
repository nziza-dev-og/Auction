import  { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

interface DashboardTabsProps {
  tabs: TabItem[];
  children: React.ReactNode[];
}

export default function DashboardTabs({ tabs, children }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {tabs.map((tab, index) => (
        <div key={tab.id} className={activeTab === tab.id ? 'mt-6' : 'hidden'}>
          {children[index]}
        </div>
      ))}
    </div>
  );
}
 