import React, { useState } from 'react';
import { EquipmentItem, PlayerParty, EquipmentSlot, EquipmentRarity } from '../types';
import { InventoryIcon, GoldIcon, SellIcon } from './Icons';
import { formatNumber } from '../utils/formatters';
import { getRarityColorClass } from '../utils/equipmentUtils';

interface InventoryPanelProps {
  inventory: EquipmentItem[];
  maxInventorySize: number;
  onOpenEquipmentModal: (memberId: string | null, slotType: EquipmentSlot | null, inventoryItemId: string) => void;
  onSelectItem?: (itemId: string) => void; // 아이템 선택 콜백 (모달 열지 않음)
  selectedInventoryItemId: string | null;
  onSellItem?: (itemId: string) => void; // 아이템 판매 콜백
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ 
  inventory, 
  maxInventorySize, 
  onOpenEquipmentModal,
  onSelectItem,
  selectedInventoryItemId,
  onSellItem
}) => {
  
  // 아이템 선택 처리
  const handleItemClick = (item: EquipmentItem) => {
    console.log("아이템 클릭됨:", item.id);
    // 아이템을 클릭했을 때 모달 열기 (원래 동작으로 복원)
    onOpenEquipmentModal(null, null, item.id);
  };

  // 아이템 판매 처리
  const handleSellItem = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault(); // 기본 동작 방지
    e.stopPropagation(); // 상위 요소에 클릭 이벤트 전파 방지
    console.log("판매 버튼 클릭됨:", itemId);
    if (onSellItem) {
      onSellItem(itemId);
    }
  };

  // 아이템 희귀도에 따른 색상 설정
  const getItemRarityColor = (rarity: EquipmentRarity) => {
    return getRarityColorClass(rarity, 'text');
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-amber-400 flex items-center">
          <InventoryIcon className="w-6 h-6 mr-2" />
          가방
        </h2>
        <span className="text-sm text-slate-400">
          {inventory.length} / {maxInventorySize} 칸
        </span>
      </div>

      {inventory.length === 0 && (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-slate-500 italic">가방이 비어 있습니다.</p>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto flex-grow pr-1">
        {inventory.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            title={`${item.name} (${item.rarity})\n${item.description || ''}`}
            className={`relative p-1.5 rounded-md aspect-square flex flex-col items-center justify-center transition-all
                        border-2 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                        ${selectedInventoryItemId === item.id ? 'ring-2 ring-amber-400 shadow-amber-500/50' : getRarityColorClass(item.rarity, 'border')}
                        ${getRarityColorClass(item.rarity, 'bg')}`}
          >
            <img
              src={`https://picsum.photos/seed/${item.iconSeed}/40/40`}
              alt={item.name}
              className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-sm mb-1"
            />
            <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight truncate w-full ${getRarityColorClass(item.rarity, 'text')}`}>
              {item.name}
            </span>
             <span className={`absolute top-0.5 right-0.5 px-1 py-0 text-[8px] rounded-bl-md rounded-tr-sm 
                           ${getRarityColorClass(item.rarity, 'bg')} ${getRarityColorClass(item.rarity, 'text')} bg-opacity-70 border-l border-b ${getRarityColorClass(item.rarity, 'border')}`}>
              {item.rarity.substring(0,1)}
            </span>
          </button>
        ))}
        {/* Fill remaining slots with empty placeholders for visual grid consistency */}
        {Array.from({ length: Math.max(0, maxInventorySize - inventory.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-slate-700/30 border-2 border-slate-600/50 rounded-md aspect-square flex items-center justify-center">
                <span className="text-slate-600 text-xs">비었음</span>
            </div>
        ))}
      </div>
      
      {selectedInventoryItemId && inventory.find(i => i.id === selectedInventoryItemId) && (
        <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <h4 className={`text-sm font-semibold ${getItemRarityColor(inventory.find(i => i.id === selectedInventoryItemId)?.rarity || 'Common')}`}>
                  {inventory.find(i => i.id === selectedInventoryItemId)?.name}
              </h4>
              {onSellItem && (
                <button 
                  onClick={(e) => handleSellItem(e, selectedInventoryItemId)}
                  className="flex items-center bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded transition-colors shadow-sm animate-pulse"
                  title="이 아이템을 판매합니다"
                >
                  <SellIcon className="w-4 h-4 mr-1" />
                  아이템 판매
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
                {inventory.find(i => i.id === selectedInventoryItemId)?.description}
            </p>
        </div>
      )}
    </div>
  );
};
