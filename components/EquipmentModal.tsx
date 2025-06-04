
import React, { useState, useEffect } from 'react';
import { EquipmentItem, PartyMember, EquipmentSlot, PlayerParty } from '../types';
import { isItemEquippable, getSlotDisplayName, getRarityColorClass } from '../utils/equipmentUtils';
import { WeaponSlotIcon, ArmorSlotIcon, ShieldSlotIcon, AccessorySlotIcon, GoldIcon, SellIcon } from './Icons';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: PartyMember | null; // The member whose slot was clicked, or to whom an inventory item might be equipped
  targetSlot: EquipmentSlot | null; // The specific slot being managed if modal opened from character panel
  inventoryItemIdToManage: string | null; // The inventory item ID if modal opened by clicking an inventory item
  inventory: EquipmentItem[];
  playerParty: PlayerParty; // To get other members for equipping from inventory item
  onEquipItem: (memberId: string, slotToEquip: EquipmentSlot, itemId: string) => void;
  onSellItem?: (itemId: string) => void; // 아이템 판매 콜백 함수 추가
  getEffectiveMemberStats: (member: PartyMember, party: PlayerParty) => any; // For stat comparison (simplified)
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  targetMember,
  targetSlot,
  inventoryItemIdToManage,
  inventory,
  playerParty,
  onEquipItem,
  onSellItem,
  getEffectiveMemberStats
}) => {
  const [selectedMemberForInventoryItem, setSelectedMemberForInventoryItem] = useState<PartyMember | null>(targetMember);
  const [selectedSlotForInventoryItem, setSelectedSlotForInventoryItem] = useState<EquipmentSlot | null>(targetSlot);
  const [selectedInventoryItemForSlot, setSelectedInventoryItemForSlot] = useState<EquipmentItem | null>(null);
  
  const itemFromInventoryManage = inventory.find(i => i.id === inventoryItemIdToManage);

  useEffect(() => {
    if (isOpen) {
        if (targetMember) setSelectedMemberForInventoryItem(targetMember);
        else if (playerParty.members.length > 0) setSelectedMemberForInventoryItem(playerParty.members.find(m => m.isUnlocked && m.isActiveInCombat) || playerParty.members[0]);
        
        if (targetSlot) setSelectedSlotForInventoryItem(targetSlot);
        else if (itemFromInventoryManage) setSelectedSlotForInventoryItem(itemFromInventoryManage.slot);

        setSelectedInventoryItemForSlot(null); // Reset selected item when modal reopens or target changes
    }
  }, [isOpen, targetMember, targetSlot, itemFromInventoryManage, playerParty.members]);


  if (!isOpen) return null;

  const currentMember = inventoryItemIdToManage ? selectedMemberForInventoryItem : targetMember;
  const currentSlot = inventoryItemIdToManage ? selectedSlotForInventoryItem : targetSlot;
  
  if (!currentMember && !itemFromInventoryManage) { // Need either a member context or an item from inventory
      console.error("EquipmentModal: Insufficient context to operate.");
      onClose();
      return null;
  }

  const compatibleItems = inventory.filter(item => 
    currentMember && currentSlot && isItemEquippable(item, currentMember.className, currentSlot) && 
    (!itemFromInventoryManage || item.id === itemFromInventoryManage.id || !targetSlot) // If managing a specific inventory item, only show that, or if no targetSlot yet, show all compatible for member
  );
  const itemToDisplayForEquip = selectedInventoryItemForSlot || (itemFromInventoryManage && currentSlot && isItemEquippable(itemFromInventoryManage, currentMember!.className, currentSlot) ? itemFromInventoryManage : null);
  const currentlyEquippedItem = currentMember && currentSlot ? currentMember.equipment[currentSlot] : null;

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const member = playerParty.members.find(m => m.id === e.target.value);
    setSelectedMemberForInventoryItem(member || null);
    if (itemFromInventoryManage && member && !isItemEquippable(itemFromInventoryManage, member.className, itemFromInventoryManage.slot)) {
      setSelectedSlotForInventoryItem(null); // Reset slot if item not compatible with new member in its own slot type
    } else if (itemFromInventoryManage) {
      setSelectedSlotForInventoryItem(itemFromInventoryManage.slot);
    }
  };

  const handleSlotSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSlotForInventoryItem(e.target.value as EquipmentSlot);
  };

  const handleEquipClick = () => {
    if (currentMember && currentSlot && itemToDisplayForEquip) {
      onEquipItem(currentMember.id, currentSlot, itemToDisplayForEquip.id);
      onClose();
    } else if (itemFromInventoryManage && currentMember && currentSlot) {
      //This case should be covered by itemToDisplayForEquip logic
       onEquipItem(currentMember.id, currentSlot, itemFromInventoryManage.id);
       onClose();
    }
  };

  // 아이템 판매 처리 함수
  const handleSellItem = () => {
    if (onSellItem && itemFromInventoryManage) {
      onSellItem(itemFromInventoryManage.id);
      onClose();
    }
  };
  
  const getSlotIcon = (slot: EquipmentSlot | null, className?: string) => {
    if (!slot) return null;
    switch (slot) {
        case 'weapon': return <WeaponSlotIcon className={className} />;
        case 'armor': return <ArmorSlotIcon className={className} />;
        case 'shield': return <ShieldSlotIcon className={className} />;
        case 'accessory': return <AccessorySlotIcon className={className} />;
        default: return null;
    }
  };

  const renderItemStats = (item: EquipmentItem | null, title: string) => {
    if (!item) return <div className="p-2 bg-slate-700/50 rounded"><p className="text-slate-400 italic">{title}: 없음</p></div>;
    return (
      <div className={`p-2 rounded ${getRarityColorClass(item.rarity, 'bg')} border ${getRarityColorClass(item.rarity, 'border')}`}>
        <h4 className={`font-semibold mb-1 ${getRarityColorClass(item.rarity, 'text')}`}>{title}: {item.name} ({item.rarity})</h4>
        <p className="text-xs text-slate-300">{item.description}</p>
        {/* Add more detailed stat display here if needed */}
      </div>
    );
  };
  
  const availableSlotsForMemberAndItem = itemFromInventoryManage && currentMember ? 
    (Object.keys(currentMember.equipment) as EquipmentSlot[]).filter(s => s === itemFromInventoryManage.slot && isItemEquippable(itemFromInventoryManage, currentMember!.className, s))
    : (Object.keys(currentMember?.equipment || {}) as EquipmentSlot[]);


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl w-full max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col text-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4 text-sky-400">
          {itemFromInventoryManage ? `아이템 장착: ${itemFromInventoryManage.name}` : `슬롯 장착: ${currentMember?.name} - ${getSlotDisplayName(currentSlot!)}`}
        </h3>

        {/* Member and Slot selection if opened from inventory item */}
        {itemFromInventoryManage && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="memberSelect" className="block text-xs font-medium text-slate-400 mb-1">대상 멤버:</label>
              <select 
                id="memberSelect"
                value={selectedMemberForInventoryItem?.id || ''}
                onChange={handleMemberSelect}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="" disabled>멤버 선택...</option>
                {playerParty.members.filter(m => m.isUnlocked).map(m => (
                  <option key={m.id} value={m.id} disabled={!isItemEquippable(itemFromInventoryManage, m.className, itemFromInventoryManage.slot)}>
                    {m.name} ({m.className}) {!isItemEquippable(itemFromInventoryManage, m.className, itemFromInventoryManage.slot) ? "- 장착불가" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="slotSelect" className="block text-xs font-medium text-slate-400 mb-1">대상 슬롯:</label>
              <select
                id="slotSelect"
                value={selectedSlotForInventoryItem || ''}
                onChange={handleSlotSelect}
                disabled={!selectedMemberForInventoryItem || availableSlotsForMemberAndItem.length === 0}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-sky-500 focus:border-sky-500"
              >
                {itemFromInventoryManage && selectedMemberForInventoryItem && isItemEquippable(itemFromInventoryManage, selectedMemberForInventoryItem.className, itemFromInventoryManage.slot) ? (
                    <option value={itemFromInventoryManage.slot}>{getSlotDisplayName(itemFromInventoryManage.slot)}</option>
                ) : (
                    <option value="" disabled>슬롯 선택 (호환 아이템 없음)</option>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Item List */}
        {!itemFromInventoryManage && currentSlot && (
            <>
                <h4 className="text-md font-medium text-slate-300 mb-2">장착 가능한 아이템 (가방):</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-48 pr-1 bg-slate-900/50 p-2 rounded-md mb-4">
                {compatibleItems.length > 0 ? compatibleItems.map(item => (
                    <button
                    key={item.id}
                    onClick={() => setSelectedInventoryItemForSlot(item)}
                    className={`p-2 rounded-md text-left border-2 transition-colors 
                                ${itemToDisplayForEquip?.id === item.id ? 'ring-2 ring-amber-400 shadow-amber-500/50' : getRarityColorClass(item.rarity, 'border')} 
                                ${getRarityColorClass(item.rarity, 'bg')}`}
                    >
                    <div className="flex items-center mb-1">
                        <img src={`https://picsum.photos/seed/${item.iconSeed}/30/30`} alt={item.name} className="w-6 h-6 mr-2 rounded-sm"/>
                        <span className={`font-semibold text-xs ${getRarityColorClass(item.rarity, 'text')}`}>{item.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                    </button>
                )) : <p className="text-slate-500 italic col-span-full text-center py-4">이 슬롯에 맞는 아이템이 가방에 없습니다.</p>}
                </div>
            </>
        )}


        {/* Comparison View */}
        {(itemToDisplayForEquip || currentlyEquippedItem) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {renderItemStats(currentlyEquippedItem, "현재 장착")}
            {renderItemStats(itemToDisplayForEquip, "선택된 아이템")}
          </div>
        )}
        
        {!itemToDisplayForEquip && !currentlyEquippedItem && !itemFromInventoryManage && (
             <p className="text-slate-500 italic text-center py-4">선택된 아이템이 없습니다.</p>
        )}


        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-slate-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition-colors"
          >
            취소
          </button>
          
          {/* 아이템 판매 버튼 */}
          {onSellItem && itemFromInventoryManage && (
            <button
              onClick={handleSellItem}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-colors flex items-center"
              title="이 아이템을 판매합니다"
            >
              <SellIcon className="w-4 h-4 mr-1.5" />
              판매하기
            </button>
          )}
          
          <button
            onClick={handleEquipClick}
            disabled={!itemToDisplayForEquip || !currentMember || !currentSlot || (itemFromInventoryManage ? !isItemEquippable(itemFromInventoryManage, currentMember.className, currentSlot) : false) }
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {getSlotIcon(currentSlot, "w-4 h-4 mr-1.5 inline-block")}
            장착하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentModal;
