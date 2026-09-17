import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CalendarRange,
  Check,
  CheckCircle2,
  Euro,
  House,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  archiveBmsReceivedEmail,
  approveBmsBooking,
  deleteBmsBooking,
  fetchBmsBookingEmails,
  fetchBmsBookings,
  fetchBmsLocations,
  fetchBmsPrices,
  fetchBmsReceivedEmails,
  cancelBmsBooking,
  fetchBmsSession,
  fetchBmsStocks,
  loginBms,
  logoutBms,
  respondToBmsReceivedEmail,
  updateBmsLocation,
  updateBmsPrice,
  updateBmsStock,
  type BmsBookingItem,
  type BmsBookingEmailLogItem,
  type BmsPriceItem,
  type BmsReceivedEmailItem,
  type BmsStockItem,
  type LocationItem,
} from '@/lib/api';

type GroupedBooking = {
  requestGroupId: string;
  confirmationCode: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  notes: string | null;
  status: string;
  createdAt: string;
  lines: Array<{
    unitType: string;
    quantity: number;
  }>;
  emails: BmsBookingEmailLogItem[];
};

type BookingStatusFilter = 'pending' | 'approved' | 'cancelled';

const bookingStatusLabels: Record<BookingStatusFilter, string> = {
  pending: 'In afwachting',
  approved: 'Geaccordeerd',
  cancelled: 'Geannuleerd',
};

type ReceivedEmailComposerState = {
  email: BmsReceivedEmailItem;
  action: 'reply' | 'forward';
  to: string;
  subject: string;
  textBody: string;
};

export function BmsAdminPage() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stocks' | 'prices' | 'locations' | 'bookings' | 'received-emails'>('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [localStocks, setLocalStocks] = useState<Record<string, number>>({});
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});
  const [localLocations, setLocalLocations] = useState<Record<string, { name: string; address: string }>>({});
  const [statusFilters, setStatusFilters] = useState<Record<BookingStatusFilter, boolean>>({
    pending: true,
    approved: true,
    cancelled: false,
  });
  const [composerState, setComposerState] = useState<ReceivedEmailComposerState | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastPosition, setToastPosition] = useState<{ top: number; left: number } | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveButtonRef = useRef<HTMLElement | null>(null);

  const showToast = (message: string) => {
    const anchorRect = lastSaveButtonRef.current?.getBoundingClientRect();

    setToastMessage(message);
    setToastPosition(
      anchorRect
        ? { top: anchorRect.top - 12, left: anchorRect.right }
        : null,
    );
    toastRef.current?.showPopover();

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      toastRef.current?.hidePopover();
    }, 2500);
  };

  // Query: BMS Session
  const sessionQuery = useQuery<{ authenticated: boolean; user?: string }>({
    queryKey: ['bms-session'],
    queryFn: fetchBmsSession,
    retry: false,
  });

  // Query: BMS Stocks
  const stocksQuery = useQuery<BmsStockItem[]>({
    queryKey: ['bms-stocks'],
    queryFn: fetchBmsStocks,
    enabled: !!sessionQuery.data?.authenticated,
  });

  // Query: BMS Prices
  const pricesQuery = useQuery<BmsPriceItem[]>({
    queryKey: ['bms-prices'],
    queryFn: fetchBmsPrices,
    enabled: !!sessionQuery.data?.authenticated,
  });

  // Query: BMS Locations
  const locationsQuery = useQuery<LocationItem[]>({
    queryKey: ['bms-locations'],
    queryFn: fetchBmsLocations,
    enabled: !!sessionQuery.data?.authenticated,
  });

  // Query: BMS Bookings
  const bookingsQuery = useQuery<BmsBookingItem[]>({
    queryKey: ['bms-bookings'],
    queryFn: fetchBmsBookings,
    enabled: !!sessionQuery.data?.authenticated,
  });

  const bookingEmailsQuery = useQuery<BmsBookingEmailLogItem[]>({
    queryKey: ['bms-booking-emails'],
    queryFn: fetchBmsBookingEmails,
    enabled: !!sessionQuery.data?.authenticated,
  });

  const receivedEmailsQuery = useQuery<BmsReceivedEmailItem[]>({
    queryKey: ['bms-received-emails'],
    queryFn: fetchBmsReceivedEmails,
    enabled: !!sessionQuery.data?.authenticated,
  });

  // Mutation: Login
  const loginMutation = useMutation({
    mutationFn: loginBms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bms-session'] });
      setLoginError(null);
    },
    onError: (err: Error) => {
      setLoginError(err.message ?? 'Inloggen mislukt.');
    },
  });

  // Mutation: Logout
  const logoutMutation = useMutation({
    mutationFn: logoutBms,
    onSuccess: () => {
      queryClient.setQueryData(['bms-session'], { authenticated: false });
      queryClient.clear();
    },
  });

  // Mutation: Update Stock
  const updateStockMutation = useMutation({
    mutationFn: updateBmsStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bms-stocks'] });
      queryClient.invalidateQueries({ queryKey: ['booking-availability'] });
      showToast('Wijzigingen opgeslagen');
    },
  });

  // Mutation: Update Price
  const updatePriceMutation = useMutation({
    mutationFn: updateBmsPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bms-prices'] });
      queryClient.invalidateQueries({ queryKey: ['booking-availability'] });
      showToast('Wijzigingen opgeslagen');
    },
  });

  // Mutation: Update Location
  const updateLocationMutation = useMutation({
    mutationFn: updateBmsLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bms-locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      showToast('Wijzigingen opgeslagen');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: cancelBmsBooking,
    onSuccess: (_, requestGroupId) => {
      queryClient.setQueryData<BmsBookingItem[]>(['bms-bookings'], (current) =>
        current?.map((booking) =>
          booking.requestGroupId === requestGroupId ? { ...booking, status: 'cancelled' } : booking,
        ) ?? current,
      );
      queryClient.invalidateQueries({ queryKey: ['bms-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bms-booking-emails'] });
      queryClient.invalidateQueries({ queryKey: ['bms-stocks'] });
      queryClient.invalidateQueries({ queryKey: ['booking-availability'] });
    },
  });

  const approveBookingMutation = useMutation({
    mutationFn: approveBmsBooking,
    onSuccess: (_, requestGroupId) => {
      queryClient.setQueryData<BmsBookingItem[]>(['bms-bookings'], (current) =>
        current?.map((booking) =>
          booking.requestGroupId === requestGroupId ? { ...booking, status: 'approved' } : booking,
        ) ?? current,
      );
      queryClient.invalidateQueries({ queryKey: ['bms-bookings'] });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBmsBooking,
    onSuccess: (_, requestGroupId) => {
      queryClient.setQueryData<BmsBookingItem[]>(['bms-bookings'], (current) =>
        current?.filter((booking) => booking.requestGroupId !== requestGroupId) ?? current,
      );
      queryClient.invalidateQueries({ queryKey: ['bms-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bms-booking-emails'] });
      queryClient.invalidateQueries({ queryKey: ['bms-stocks'] });
      queryClient.invalidateQueries({ queryKey: ['booking-availability'] });
    },
  });

  const respondToReceivedEmailMutation = useMutation({
    mutationFn: ({
      emailId,
      payload,
    }: {
      emailId: string;
      payload: {
        action: 'reply' | 'forward';
        to: string[];
        subject: string;
        textBody: string;
      };
    }) => respondToBmsReceivedEmail(emailId, payload),
    onSuccess: () => {
      setComposerState(null);
    },
  });

  const archiveReceivedEmailMutation = useMutation({
    mutationFn: archiveBmsReceivedEmail,
    onSuccess: (_, emailId) => {
      queryClient.setQueryData<BmsReceivedEmailItem[]>(['bms-received-emails'], (current) =>
        current?.filter((email) => email.id !== emailId) ?? current,
      );
      queryClient.invalidateQueries({ queryKey: ['bms-received-emails'] });
    },
  });

  // Sync stocks list once loaded
  React.useEffect(() => {
    if (stocksQuery.data) {
      const initial: Record<string, number> = {};
      stocksQuery.data.forEach((item) => {
        initial[item.unitType] = item.totalStock;
      });
      setLocalStocks(initial);
    }
  }, [stocksQuery.data]);

  // Sync prices list once loaded
  React.useEffect(() => {
    if (pricesQuery.data) {
      const initial: Record<string, number> = {};
      pricesQuery.data.forEach((item) => {
        initial[item.unitType] = item.price;
      });
      setLocalPrices(initial);
    }
  }, [pricesQuery.data]);

  // Sync locations list once loaded
  React.useEffect(() => {
    if (locationsQuery.data) {
      const initial: Record<string, { name: string; address: string }> = {};
      locationsQuery.data.forEach((item) => {
        initial[item.id] = { name: item.name, address: item.address };
      });
      setLocalLocations(initial);
    }
  }, [locationsQuery.data]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLoginError('Vul a.u.b. alle velden in.');
      return;
    }
    loginMutation.mutate({ username, password });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleStockChange = (unitType: string, val: number) => {
    const nextVal = Math.max(0, val);
    setLocalStocks((prev) => ({
      ...prev,
      [unitType]: nextVal,
    }));
  };

  const handleSaveStock = (unitType: string, anchor: HTMLElement) => {
    const stock = localStocks[unitType];
    if (stock !== undefined) {
      lastSaveButtonRef.current = anchor;
      updateStockMutation.mutate({ unitType, stock });
    }
  };

  const handlePriceChange = (unitType: string, val: number) => {
    const nextVal = Math.max(0, val);
    setLocalPrices((prev) => ({
      ...prev,
      [unitType]: nextVal,
    }));
  };

  const handleSavePrice = (unitType: string, anchor: HTMLElement) => {
    const price = localPrices[unitType];
    if (price !== undefined) {
      lastSaveButtonRef.current = anchor;
      updatePriceMutation.mutate({ unitType, price });
    }
  };

  const handleLocationFieldChange = (id: string, field: 'name' | 'address', value: string) => {
    setLocalLocations((prev) => ({
      ...prev,
      [id]: {
        name: prev[id]?.name ?? '',
        address: prev[id]?.address ?? '',
        [field]: value,
      },
    }));
  };

  const handleSaveLocation = (id: string, anchor: HTMLElement) => {
    const location = localLocations[id];
    if (location && location.name.trim() && location.address.trim()) {
      lastSaveButtonRef.current = anchor;
      updateLocationMutation.mutate({ id, name: location.name.trim(), address: location.address.trim() });
    }
  };

  const handleCancelBooking = (requestGroupId: string, guestName: string) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je de boeking van ${guestName} wilt annuleren? De boeking blijft zichtbaar in admin, maar telt niet meer mee in de beschikbaarheid.`,
    );

    if (!confirmed) {
      return;
    }

    cancelBookingMutation.mutate(requestGroupId);
  };

  const handleApproveBooking = (requestGroupId: string, guestName: string) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je de boeking van ${guestName} wilt accorderen?`,
    );

    if (!confirmed) {
      return;
    }

    approveBookingMutation.mutate(requestGroupId);
  };

  const handleDeleteBooking = (requestGroupId: string, guestName: string) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je de geannuleerde boeking van ${guestName} definitief wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`,
    );

    if (!confirmed) {
      return;
    }

    deleteBookingMutation.mutate(requestGroupId);
  };

  const openReceivedEmailComposer = (email: BmsReceivedEmailItem, action: 'reply' | 'forward') => {
    const defaultReplyRecipient = email.replyTo[0] || email.from;
    const defaultSubject =
      action === 'reply'
        ? email.subject.toLowerCase().startsWith('re:')
          ? email.subject
          : `Re: ${email.subject}`
        : email.subject.toLowerCase().startsWith('fwd:')
          ? email.subject
          : `Fwd: ${email.subject}`;

    setComposerState({
      email,
      action,
      to: action === 'reply' ? defaultReplyRecipient : '',
      subject: defaultSubject,
      textBody: '',
    });
  };

  const closeReceivedEmailComposer = () => {
    if (respondToReceivedEmailMutation.isPending) {
      return;
    }

    setComposerState(null);
  };

  const submitReceivedEmailComposer = () => {
    if (!composerState) {
      return;
    }

    const recipients = composerState.to
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (recipients.length === 0 || !composerState.subject.trim() || !composerState.textBody.trim()) {
      return;
    }

    respondToReceivedEmailMutation.mutate({
      emailId: composerState.email.id,
      payload: {
        action: composerState.action,
        to: recipients,
        subject: composerState.subject.trim(),
        textBody: composerState.textBody.trim(),
      },
    });
  };

  const handleArchiveReceivedEmail = (email: BmsReceivedEmailItem) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je de ontvangen e-mail "${email.subject}" wilt archiveren? Deze verdwijnt uit het overzicht, maar blijft bestaan in Resend.`,
    );

    if (!confirmed) {
      return;
    }

    archiveReceivedEmailMutation.mutate(email.id);
  };

  // Group bookings by requestGroupId
  const getGroupedBookings = (
    items: BmsBookingItem[],
    emailsByRequestGroupId: Map<string, BmsBookingEmailLogItem[]>,
  ): GroupedBooking[] => {
    const grouped = new Map<string, GroupedBooking>();
    items.forEach((item) => {
      if (!grouped.has(item.requestGroupId)) {
        grouped.set(item.requestGroupId, {
          requestGroupId: item.requestGroupId,
          confirmationCode: item.confirmationCode,
          guestName: item.guestName,
          guestEmail: item.guestEmail,
          guestPhone: item.guestPhone,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          notes: item.notes,
          status: item.status,
          createdAt: item.createdAt,
          lines: [],
          emails: emailsByRequestGroupId.get(item.requestGroupId) ?? [],
        });
      }
      grouped.get(item.requestGroupId)!.lines.push({
        unitType: item.unitType,
        quantity: item.quantity,
      });
    });
    return Array.from(grouped.values());
  };

  const getUnitTitle = (unitType: string): string => {
    if (stocksQuery.data) {
      const found = stocksQuery.data.find((item) => item.unitType === unitType);
      return found ? found.title : `Type ${unitType}`;
    }
    return `Type ${unitType}`;
  };

  // Render Loading
  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 animate-spin text-[#76BD23]" />
          <p className="text-stone-300">Laden van BMS sessie...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = sessionQuery.data?.authenticated;

  // Render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
        <div className="border-border/75 bg-card/75 w-full max-w-md rounded-[2rem] border p-8 shadow-[0_22px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#1C5733]/40 border border-[#76BD23]/25 mb-4 shadow-[0_0_20px_rgba(118,189,35,0.15)]">
              <Lock className="size-6 text-[#76BD23]" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              CrossVillage
            </h1>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-6">
            {loginError && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/12 border border-destructive/25 p-4 text-sm text-destructive-foreground">
                <AlertCircle className="size-5 shrink-0 text-red-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-stone-200 font-medium">Gebruikersnaam</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                  <Users className="size-5" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Gebruikersnaam"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 rounded-2xl bg-black/20 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-[#76BD23]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-200 font-medium">Wachtwoord</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="size-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Wachtwoord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-2xl bg-black/20 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-[#76BD23]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-2xl bg-[#76BD23] py-6 font-semibold text-[#10311c] hover:bg-[#6eb220] transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <RefreshCw className="size-5 animate-spin mr-2" />
              ) : (
                'Inloggen'
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Filter Bookings
  const rawBookings = bookingsQuery.data ?? [];
  const bookingEmails = bookingEmailsQuery.data ?? [];
  const bookingEmailsByRequestGroupId = new Map<string, BmsBookingEmailLogItem[]>();

  bookingEmails.forEach((email) => {
    const current = bookingEmailsByRequestGroupId.get(email.requestGroupId) ?? [];
    current.push(email);
    bookingEmailsByRequestGroupId.set(email.requestGroupId, current);
  });

  const groupedBookings = getGroupedBookings(rawBookings, bookingEmailsByRequestGroupId);
  const filteredBookings = groupedBookings.filter((booking) => {
    const normalizedStatus = booking.status.toLowerCase() as BookingStatusFilter;
    if (normalizedStatus in statusFilters && !statusFilters[normalizedStatus]) {
      return false;
    }

    const query = searchQuery.toLowerCase();
    return (
      booking.guestName.toLowerCase().includes(query) ||
      booking.guestEmail.toLowerCase().includes(query) ||
      booking.requestGroupId.toLowerCase().includes(query) ||
      booking.confirmationCode?.includes(query)
    );
  });
  const receivedEmails = receivedEmailsQuery.data ?? [];
  const filteredReceivedEmails = receivedEmails.filter((email) => {
    const query = searchQuery.toLowerCase();

    return (
      email.subject.toLowerCase().includes(query) ||
      email.from.toLowerCase().includes(query) ||
      email.to.some((recipient) => recipient.toLowerCase().includes(query)) ||
      (email.textBody?.toLowerCase().includes(query) ?? false) ||
      (email.htmlBody?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="border-border bg-card/85 flex flex-col gap-4 rounded-[2rem] border p-6 shadow-md md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white">
            CrossVillage BMS
          </h1>
          <p className="text-sm text-stone-300">
            Ingelogd als <span className="font-semibold text-[#76BD23]">{sessionQuery.data?.user}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-full border-white/10 bg-black/10 text-stone-200 transition hover:bg-white/6 hover:text-white"
          >
            <LogOut className="size-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'stocks'
              ? 'border-[#76BD23] text-white'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <House className="size-4" />
          Voorraad & Beschikbaarheid
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'prices'
              ? 'border-[#76BD23] text-white'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Euro className="size-4" />
          Prijzen
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'locations'
              ? 'border-[#76BD23] text-white'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <MapPin className="size-4" />
          Locaties
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'bookings'
              ? 'border-[#76BD23] text-white'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <CalendarRange className="size-4" />
          Boekingen ({groupedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('received-emails')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'received-emails'
              ? 'border-[#76BD23] text-white'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <CalendarRange className="size-4" />
          Ontvangen e-mails ({receivedEmails.length})
        </button>
      </div>

      {/* Stocks Tab Panel */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          {stocksQuery.isLoading ? (
            <div className="flex py-12 items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-[#76BD23]" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {stocksQuery.data?.map((stockItem) => {
                const localVal = localStocks[stockItem.unitType] ?? stockItem.totalStock;
                const hasChanged = localVal !== stockItem.totalStock;
                const isSaving =
                  updateStockMutation.isPending &&
                  updateStockMutation.variables?.unitType === stockItem.unitType;

                return (
                  <div
                    key={stockItem.unitType}
                    className="border-border bg-card/60 flex flex-col justify-between rounded-[1.5rem] border p-5 transition hover:border-white/15 hover:bg-card/75"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">
                            {stockItem.title}
                          </h3>
                          <p className="text-xs text-stone-400 mt-1">Code: {stockItem.unitType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`rounded-full px-2.5 py-0.5 border ${
                              stockItem.isOverridden
                                ? 'bg-[#1C5733]/20 border-[#76BD23]/30 text-[#D9F0B6]'
                                : 'bg-black/20 border-white/10 text-stone-400'
                            }`}
                          >
                            {stockItem.isOverridden ? 'Aangepast' : 'Standaard'}
                          </Badge>
                          {stockItem.remaining === 0 && (
                            <Badge className="rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 text-destructive-foreground">
                              Vol
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Occupational Summary */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-black/15 border border-white/6 p-3 text-center text-xs">
                        <div>
                          <p className="text-stone-400 font-medium">Totaal</p>
                          <p className="mt-0.5 text-base font-bold text-white">
                            {stockItem.totalStock}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400 font-medium">Geboekt</p>
                          <p className="mt-0.5 text-base font-bold text-[#D6CAA0]">
                            {stockItem.reserved}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400 font-medium">Resterend</p>
                          <p
                            className={`mt-0.5 text-base font-bold ${
                              stockItem.remaining === 0
                                ? 'text-destructive-foreground font-black'
                                : 'text-[#76BD23]'
                            }`}
                          >
                            {stockItem.remaining === 0 ? 'VOL' : stockItem.remaining}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/6 pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleStockChange(stockItem.unitType, localVal - 1)}
                          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/10 text-stone-300 hover:border-[#76BD23]/40 hover:bg-[#1C5733]/15 hover:text-white"
                        >
                          <Minus className="size-4" />
                        </button>
                        <Input
                          type="number"
                          value={localVal}
                          onChange={(e) =>
                            handleStockChange(stockItem.unitType, parseInt(e.target.value) || 0)
                          }
                          className="w-16 text-center rounded-xl bg-black/20 border-white/10 text-white font-semibold focus-visible:ring-[#76BD23]"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockChange(stockItem.unitType, localVal + 1)}
                          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/10 text-stone-300 hover:border-[#76BD23]/40 hover:bg-[#1C5733]/15 hover:text-white"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasChanged && (
                          <Button
                            onClick={(e) => handleSaveStock(stockItem.unitType, e.currentTarget)}
                            disabled={isSaving}
                            className="rounded-full bg-[#76BD23] px-4 font-semibold text-[#10311c] hover:bg-[#6eb220]"
                          >
                            {isSaving ? (
                              <RefreshCw className="size-4 animate-spin mr-1.5" />
                            ) : (
                              <CheckCircle2 className="size-4 mr-1.5" />
                            )}
                            Opslaan
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Prices Tab Panel */}
      {activeTab === 'prices' && (
        <div className="space-y-4">
          {pricesQuery.isLoading ? (
            <div className="flex py-12 items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-[#76BD23]" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pricesQuery.data?.map((priceItem) => {
                const localVal = localPrices[priceItem.unitType] ?? priceItem.price;
                const hasChanged = localVal !== priceItem.price;
                const isSaving =
                  updatePriceMutation.isPending &&
                  updatePriceMutation.variables?.unitType === priceItem.unitType;

                return (
                  <div
                    key={priceItem.unitType}
                    className="border-border bg-card/60 flex flex-col justify-between rounded-[1.5rem] border p-5 transition hover:border-white/15 hover:bg-card/75"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">
                            {priceItem.title}
                          </h3>
                          <p className="text-xs text-stone-400 mt-1">Code: {priceItem.unitType}</p>
                        </div>
                        <Badge
                          className={`rounded-full px-2.5 py-0.5 border ${
                            priceItem.isOverridden
                              ? 'bg-[#1C5733]/20 border-[#76BD23]/30 text-[#D9F0B6]'
                              : 'bg-black/20 border-white/10 text-stone-400'
                          }`}
                        >
                          {priceItem.isOverridden ? 'Aangepast' : 'Standaard'}
                        </Badge>
                      </div>

                      <div className="mt-4 rounded-2xl bg-black/15 border border-white/6 p-3 text-center text-xs">
                        <p className="text-stone-400 font-medium">Prijs per nacht</p>
                        <p className="mt-0.5 text-base font-bold text-white">
                          &euro; {priceItem.price}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/6 pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handlePriceChange(priceItem.unitType, localVal - 5)}
                          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/10 text-stone-300 hover:border-[#76BD23]/40 hover:bg-[#1C5733]/15 hover:text-white"
                        >
                          <Minus className="size-4" />
                        </button>
                        <Input
                          type="number"
                          value={localVal}
                          onChange={(e) =>
                            handlePriceChange(priceItem.unitType, parseInt(e.target.value) || 0)
                          }
                          className="w-20 text-center rounded-xl bg-black/20 border-white/10 text-white font-semibold focus-visible:ring-[#76BD23]"
                        />
                        <button
                          type="button"
                          onClick={() => handlePriceChange(priceItem.unitType, localVal + 5)}
                          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/10 text-stone-300 hover:border-[#76BD23]/40 hover:bg-[#1C5733]/15 hover:text-white"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasChanged && (
                          <Button
                            onClick={(e) => handleSavePrice(priceItem.unitType, e.currentTarget)}
                            disabled={isSaving}
                            className="rounded-full bg-[#76BD23] px-4 font-semibold text-[#10311c] hover:bg-[#6eb220]"
                          >
                            {isSaving ? (
                              <RefreshCw className="size-4 animate-spin mr-1.5" />
                            ) : (
                              <CheckCircle2 className="size-4 mr-1.5" />
                            )}
                            Opslaan
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Locations Tab Panel */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          {locationsQuery.isLoading ? (
            <div className="flex py-12 items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-[#76BD23]" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {locationsQuery.data?.map((location) => {
                const localValue = localLocations[location.id] ?? { name: location.name, address: location.address };
                const hasChanged =
                  localValue.name !== location.name || localValue.address !== location.address;
                const isSaving =
                  updateLocationMutation.isPending &&
                  updateLocationMutation.variables?.id === location.id;

                return (
                  <div
                    key={location.id}
                    className="border-border bg-card/60 flex flex-col justify-between rounded-[1.5rem] border p-5 transition hover:border-white/15 hover:bg-card/75"
                  >
                    <div className="space-y-3">
                      <div>
                        <Label className="text-stone-400 font-medium text-xs">Naam</Label>
                        <Input
                          type="text"
                          value={localValue.name}
                          onChange={(e) => handleLocationFieldChange(location.id, 'name', e.target.value)}
                          className="mt-1 rounded-xl bg-black/20 border-white/10 text-white font-semibold focus-visible:ring-[#76BD23]"
                        />
                      </div>
                      <div>
                        <Label className="text-stone-400 font-medium text-xs">Adres</Label>
                        <Input
                          type="text"
                          value={localValue.address}
                          onChange={(e) => handleLocationFieldChange(location.id, 'address', e.target.value)}
                          className="mt-1 rounded-xl bg-black/20 border-white/10 text-white focus-visible:ring-[#76BD23]"
                        />
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/6 pt-4 flex items-center justify-end">
                      {hasChanged && (
                        <Button
                          onClick={(e) => handleSaveLocation(location.id, e.currentTarget)}
                          disabled={isSaving || !localValue.name.trim() || !localValue.address.trim()}
                          className="rounded-full bg-[#76BD23] px-4 font-semibold text-[#10311c] hover:bg-[#6eb220]"
                        >
                          {isSaving ? (
                            <RefreshCw className="size-4 animate-spin mr-1.5" />
                          ) : (
                            <CheckCircle2 className="size-4 mr-1.5" />
                          )}
                          Opslaan
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab Panel */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
              <Search className="size-5" />
            </div>
            <Input
              type="text"
              placeholder="Zoek op gastnaam, e-mail of code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl bg-card/60 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-[#76BD23]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(bookingStatusLabels) as BookingStatusFilter[]).map((status) => {
              const count = groupedBookings.filter((booking) => booking.status === status).length;
              const isActive = statusFilters[status];

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilters((current) => ({
                      ...current,
                      [status]: !current[status],
                    }))
                  }
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'border-[#76BD23]/35 bg-[#1C5733]/30 text-white'
                      : 'border-white/10 bg-black/10 text-stone-400 hover:text-white'
                  }`}
                >
                  {bookingStatusLabels[status]} ({count})
                </button>
              );
            })}
          </div>

          {bookingsQuery.isLoading || bookingEmailsQuery.isLoading ? (
            <div className="flex py-12 items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-[#76BD23]" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="border-border bg-card/40 rounded-[2rem] border p-12 text-center">
              <AlertCircle className="size-8 text-stone-400 mx-auto" />
              <p className="mt-3 text-stone-300 font-medium">Geen boekingen gevonden.</p>
              <p className="mt-1 text-sm text-stone-400">
                Er zijn momenteel geen boekingen die voldoen aan de zoekcriteria of filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => {
                const checkInDate = new Date(booking.checkIn);
                const checkOutDate = new Date(booking.checkOut);
                const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const formattedDate = new Date(booking.createdAt).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const formattedCheckIn = checkInDate.toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                const formattedCheckOut = checkOutDate.toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                const isCancelled = booking.status === 'cancelled';
                const isApproved = booking.status === 'approved';
                const isCancelling =
                  cancelBookingMutation.isPending &&
                  cancelBookingMutation.variables === booking.requestGroupId;
                const isApproving =
                  approveBookingMutation.isPending &&
                  approveBookingMutation.variables === booking.requestGroupId;
                const isDeleting =
                  deleteBookingMutation.isPending &&
                  deleteBookingMutation.variables === booking.requestGroupId;
                const bookingCode = booking.confirmationCode ?? booking.requestGroupId.slice(0, 6);

                return (
                  <details
                    key={booking.requestGroupId}
                    className="border-border bg-card/60 rounded-[1.5rem] border p-5 transition hover:border-white/15 hover:bg-card/75"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-lg font-bold text-white">{booking.guestName}</h3>
                            <Badge className="rounded-full border-white/8 bg-black/20 text-stone-300 font-mono text-xs">
                              Code: {bookingCode}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-300">
                            <p>
                              <span className="text-stone-400">E-mail:</span> {booking.guestEmail}
                            </p>
                            <p>
                              <span className="text-stone-400">Verblijf:</span> {formattedCheckIn} t/m {formattedCheckOut}
                            </p>
                            <p>
                              <span className="text-stone-400">Units:</span> {booking.lines.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                          <Badge
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              isCancelled
                                ? 'border-red-500/25 bg-red-500/15 text-red-100'
                                : isApproved
                                  ? 'border-sky-500/25 bg-sky-500/15 text-sky-100'
                                  : 'border-[#76BD23]/25 bg-[#1C5733]/30 text-[#D9F0B6]'
                            }`}
                          >
                            Status: {isCancelled ? 'Geannuleerd' : isApproved ? 'Geaccordeerd' : booking.status}
                          </Badge>
                          <Badge className="rounded-full border-white/8 bg-black/20 text-stone-300 text-xs">
                            Geboekt op {formattedDate}
                          </Badge>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/6 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleApproveBooking(booking.requestGroupId, booking.guestName)}
                        disabled={isApproving || isApproved || isCancelled}
                        className="rounded-full border-sky-500/25 bg-sky-500/10 px-3 text-sky-100 hover:bg-sky-500/20 hover:text-white disabled:opacity-50"
                      >
                        {isApproving ? (
                          <RefreshCw className="mr-1.5 size-4 animate-spin" />
                        ) : (
                          <Check className="mr-1.5 size-4" />
                        )}
                        {isApproved ? 'Geaccordeerd' : 'Akkoord'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCancelBooking(booking.requestGroupId, booking.guestName)}
                        disabled={isCancelling || isCancelled || isDeleting}
                        className="rounded-full border-red-500/25 bg-red-500/10 px-3 text-red-100 hover:bg-red-500/20 hover:text-white disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <RefreshCw className="mr-1.5 size-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 size-4" />
                        )}
                        {isCancelled ? 'Geannuleerd' : 'Annuleren'}
                      </Button>
                      {isCancelled && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDeleteBooking(booking.requestGroupId, booking.guestName)}
                          disabled={isDeleting}
                          className="rounded-full border-red-700/35 bg-red-950/40 px-3 text-red-200 hover:bg-red-900/60 hover:text-white disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <RefreshCw className="mr-1.5 size-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1.5 size-4" />
                          )}
                          Verwijderen
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-white/6 pt-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-black/10 border border-white/6 p-4">
                        <p className="text-xs font-semibold uppercase text-stone-400 tracking-wider">
                          Verblijfsperiode
                        </p>
                        <div className="mt-2.5 flex items-center justify-between text-sm text-white font-medium">
                          <div>
                            <p className="text-xs text-stone-400 font-normal">Aankomst</p>
                            <p className="mt-0.5">{formattedCheckIn}</p>
                          </div>
                          <div className="h-px bg-white/10 flex-1 mx-4 self-end mb-2" />
                          <div className="text-right">
                            <p className="text-xs text-stone-400 font-normal">Vertrek</p>
                            <p className="mt-0.5">{formattedCheckOut}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-stone-300">
                          Totaal: <span className="font-semibold text-white">{diffDays} nachten</span>
                        </p>
                      </div>

                      <div className="rounded-2xl bg-black/10 border border-white/6 p-4">
                        <p className="text-xs font-semibold uppercase text-stone-400 tracking-wider">
                          Gereserveerde accommodaties
                        </p>
                        <div className="mt-2.5 space-y-2 text-sm">
                          {booking.lines.map((line, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between border-b border-white/4 pb-1.5 last:border-0 last:pb-0"
                            >
                              <p className="text-white font-medium">{getUnitTitle(line.unitType)}</p>
                              <Badge className="rounded-full bg-[#76BD23]/15 text-[#76BD23] border border-[#76BD23]/25 font-bold">
                                {line.quantity}x
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {booking.notes && (
                      <div className="mt-4 rounded-xl bg-black/15 border border-dashed border-white/10 p-3 text-xs text-stone-300">
                        <span className="font-semibold text-white mr-1">Opmerkingen/Notities:</span>
                        {booking.notes}
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl bg-black/10 border border-white/6 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                        E-mailverzending
                      </p>
                      {booking.emails.length === 0 ? (
                        <p className="mt-2.5 text-sm text-stone-400">
                          Nog geen e-mailpogingen geregistreerd voor deze boeking.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {booking.emails.map((email) => {
                            const formattedEmailDate = new Date(email.createdAt).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                            const formattedProviderDate = email.providerCreatedAt
                              ? new Date(email.providerCreatedAt).toLocaleDateString('nl-NL', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : null;
                            const isSent = email.status === 'sent';
                            const isSkipped = email.status === 'skipped';

                            return (
                              <div
                                key={email.id}
                                className="rounded-xl border border-white/8 bg-black/15 p-3"
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">{email.subject}</p>
                                    <p className="mt-1 text-xs text-stone-400">
                                      Naar {email.recipientEmail} via {email.provider} op {formattedEmailDate}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`rounded-full border px-2.5 py-0.5 text-xs ${
                                      isSent
                                        ? 'border-[#76BD23]/35 bg-[#1C5733]/30 text-[#D9F0B6]'
                                        : isSkipped
                                          ? 'border-amber-500/30 bg-amber-500/15 text-amber-100'
                                          : 'border-red-500/25 bg-red-500/15 text-red-100'
                                    }`}
                                  >
                                    {isSent ? 'Verzonden' : isSkipped ? 'Overgeslagen' : 'Mislukt'}
                                  </Badge>
                                </div>

                                {email.providerMessageId && (
                                  <p className="mt-2 text-xs text-stone-400">
                                    Resend ID: <span className="font-mono text-stone-300">{email.providerMessageId}</span>
                                  </p>
                                )}

                                {email.providerLastEvent && (
                                  <p className="mt-2 text-xs text-stone-400">
                                    Resend status: <span className="font-semibold text-stone-200">{email.providerLastEvent}</span>
                                    {formattedProviderDate ? ` op ${formattedProviderDate}` : ''}
                                  </p>
                                )}

                                {email.providerFrom && (
                                  <p className="mt-1 text-xs text-stone-400">
                                    Van: {email.providerFrom}
                                    {email.providerTo?.length ? ` • Aan: ${email.providerTo.join(', ')}` : ''}
                                  </p>
                                )}

                                {email.errorMessage && (
                                  <p className="mt-2 text-xs text-red-200">
                                    Fout: {email.errorMessage}
                                  </p>
                                )}

                                <details className="mt-3">
                                  <summary className="cursor-pointer text-xs font-semibold text-stone-300 hover:text-white">
                                    Body bekijken
                                  </summary>
                                  <div className="mt-2 space-y-3">
                                    <div>
                                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                        Tekstversie
                                      </p>
                                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-xs leading-6 text-stone-300">
                                        {email.textBody}
                                      </pre>
                                    </div>
                                    <div>
                                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                        HTML-versie
                                      </p>
                                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-xs leading-6 text-stone-300">
                                        {email.htmlBody}
                                      </pre>
                                    </div>
                                  </div>
                                </details>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'received-emails' && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
              <Search className="size-5" />
            </div>
            <Input
              type="text"
              placeholder="Zoek op onderwerp, afzender of inhoud..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl bg-card/60 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-[#76BD23]"
            />
          </div>

          {receivedEmailsQuery.isLoading ? (
            <div className="flex py-12 items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-[#76BD23]" />
            </div>
          ) : receivedEmailsQuery.isError ? (
            <div className="border border-red-400/20 bg-red-400/10 rounded-[2rem] p-5 text-sm text-red-100">
              {receivedEmailsQuery.error instanceof Error
                ? receivedEmailsQuery.error.message
                : 'Kon ontvangen e-mails niet laden.'}
            </div>
          ) : filteredReceivedEmails.length === 0 ? (
            <div className="border-border bg-card/40 rounded-[2rem] border p-12 text-center">
              <AlertCircle className="size-8 text-stone-400 mx-auto" />
              <p className="mt-3 text-stone-300 font-medium">Geen ontvangen e-mails gevonden.</p>
              <p className="mt-1 text-sm text-stone-400">
                Er zijn momenteel geen ontvangen e-mails die voldoen aan de zoekcriteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReceivedEmails.map((email) => {
                const formattedReceivedDate = new Date(email.createdAt).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const preferredBody = email.textBody?.trim() || email.htmlBody?.trim() || 'Geen inhoud beschikbaar.';

                return (
                  <div
                    key={email.id}
                    className="border-border bg-card/60 flex flex-col rounded-[1.5rem] border p-5 transition hover:border-white/15 hover:bg-card/75"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-white">{email.subject}</h3>
                        <div className="mt-2 space-y-1 text-sm text-stone-300">
                          <p><span className="text-stone-400">Van:</span> {email.from}</p>
                          <p><span className="text-stone-400">Aan:</span> {email.to.join(', ') || '-'}</p>
                          <p><span className="text-stone-400">Ontvangen op:</span> {formattedReceivedDate}</p>
                        </div>
                      </div>
                      <Badge className="rounded-full border-white/8 bg-black/20 text-stone-300 font-mono text-xs">
                        {email.id}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openReceivedEmailComposer(email, 'reply')}
                        className="rounded-full border-[#76BD23]/35 bg-[#1C5733]/20 px-4 text-[#D9F0B6] hover:bg-[#1C5733]/35 hover:text-white"
                      >
                        Beantwoorden
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openReceivedEmailComposer(email, 'forward')}
                        className="rounded-full border-white/10 bg-black/10 px-4 text-stone-200 hover:bg-white/6 hover:text-white"
                      >
                        Doorsturen
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleArchiveReceivedEmail(email)}
                        disabled={archiveReceivedEmailMutation.isPending && archiveReceivedEmailMutation.variables === email.id}
                        className="rounded-full border-red-500/25 bg-red-500/10 px-4 text-red-100 hover:bg-red-500/20 hover:text-white disabled:opacity-50"
                      >
                        {archiveReceivedEmailMutation.isPending && archiveReceivedEmailMutation.variables === email.id ? (
                          <RefreshCw className="mr-1.5 size-4 animate-spin" />
                        ) : null}
                        Archiveren
                      </Button>
                    </div>

                    <details className="mt-4 rounded-2xl bg-black/10 border border-white/6 p-4">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-white">
                        Inhoud bekijken
                      </summary>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-xs leading-6 text-stone-300">
                        {preferredBody}
                      </pre>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {composerState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#161b1d] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                  {composerState.action === 'reply' ? 'Beantwoorden' : 'Doorsturen'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{composerState.subject}</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={closeReceivedEmailComposer}
                disabled={respondToReceivedEmailMutation.isPending}
                className="rounded-full border-white/10 bg-black/10 text-stone-200 hover:bg-white/6 hover:text-white"
              >
                Sluiten
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="received-email-to" className="text-stone-200 font-medium">Aan</Label>
                <Input
                  id="received-email-to"
                  value={composerState.to}
                  onChange={(event) =>
                    setComposerState((current) => (current ? { ...current, to: event.target.value } : current))
                  }
                  className="rounded-2xl bg-black/20 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-[#76BD23]"
                  placeholder="naam@voorbeeld.nl, tweede@voorbeeld.nl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="received-email-subject" className="text-stone-200 font-medium">Onderwerp</Label>
                <Input
                  id="received-email-subject"
                  value={composerState.subject}
                  onChange={(event) =>
                    setComposerState((current) => (current ? { ...current, subject: event.target.value } : current))
                  }
                  className="rounded-2xl bg-black/20 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-[#76BD23]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="received-email-text" className="text-stone-200 font-medium">Bericht</Label>
                <textarea
                  id="received-email-text"
                  value={composerState.textBody}
                  onChange={(event) =>
                    setComposerState((current) => (current ? { ...current, textBody: event.target.value } : current))
                  }
                  className="min-h-48 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-[#76BD23]/45"
                  placeholder="Typ hier je antwoord of toelichting..."
                />
              </div>

              <details className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-white">
                  Oorspronkelijke e-mail
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-xs leading-6 text-stone-300">
                  {composerState.email.textBody?.trim() || composerState.email.htmlBody?.trim() || 'Geen inhoud beschikbaar.'}
                </pre>
              </details>

              {respondToReceivedEmailMutation.isError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                  {respondToReceivedEmailMutation.error instanceof Error
                    ? respondToReceivedEmailMutation.error.message
                    : 'Kon de e-mailactie niet uitvoeren.'}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeReceivedEmailComposer}
                  disabled={respondToReceivedEmailMutation.isPending}
                  className="rounded-full border-white/10 bg-black/10 text-stone-200 hover:bg-white/6 hover:text-white"
                >
                  Annuleren
                </Button>
                <Button
                  type="button"
                  onClick={submitReceivedEmailComposer}
                  disabled={
                    respondToReceivedEmailMutation.isPending ||
                    !composerState.to.trim() ||
                    !composerState.subject.trim() ||
                    !composerState.textBody.trim()
                  }
                  className="rounded-full bg-[#76BD23] px-5 text-[#10311c] hover:bg-[#6eb220]"
                >
                  {respondToReceivedEmailMutation.isPending ? (
                    <RefreshCw className="mr-1.5 size-4 animate-spin" />
                  ) : null}
                  Verzenden
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={toastRef}
        popover="manual"
        className="bms-toast"
        style={
          toastPosition
            ? { top: `${toastPosition.top}px`, left: `${toastPosition.left}px`, bottom: 'auto', right: 'auto' }
            : undefined
        }
      >
        <CheckCircle2 className="size-4 text-[#76BD23]" />
        {toastMessage}
      </div>
    </div>
  );
}
