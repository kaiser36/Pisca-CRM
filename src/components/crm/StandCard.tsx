import React from 'react';
import { Stand } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, User, Building } from 'lucide-react';

interface StandCardProps {
  stand: Stand;
}

const StandCard: React.FC<StandCardProps> = ({ stand }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{stand.Stand_ID}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center">
          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Company_Name}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Address}, {stand.Postal_Code} {stand.City}</span>
        </div>
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Phone}</span>
        </div>
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Email}</span>
        </div>
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{stand.Contact_Person}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandCard;