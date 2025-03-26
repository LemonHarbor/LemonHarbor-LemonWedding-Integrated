import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";
import {
  getAppointmentsByVendor,
  getAppointmentById,
} from "@/services/appointmentService";

// Hook for real-time appointment updates by vendor
export function useRealtimeAppointments(vendorId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!vendorId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentsByVendor(vendorId);
        setAppointments(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching vendor appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`vendor-appointments-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_appointments",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "INSERT") {
            setAppointments((current) => [newRecord, ...current]);
            toast({
              title: "Appointment Added",
              description: `A new appointment "${newRecord.title}" has been scheduled.`,
            });
          } else if (eventType === "UPDATE") {
            setAppointments((current) =>
              current.map((appointment) =>
                appointment.id === oldRecord.id ? newRecord : appointment,
              ),
            );
            toast({
              title: "Appointment Updated",
              description: `Appointment "${newRecord.title}" has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setAppointments((current) =>
              current.filter((appointment) => appointment.id !== oldRecord.id),
            );
            toast({
              title: "Appointment Removed",
              description: `Appointment "${oldRecord.title}" has been removed.`,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [vendorId, toast]);

  return { appointments, loading, error };
}

// Hook for real-time upcoming appointments
export function useRealtimeUpcomingAppointments(days: number = 7) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial data
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
          .from("vendor_appointments")
          .select("*")
          .gte("start_time", now.toISOString())
          .lte("start_time", future.toISOString())
          .order("start_time", { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching upcoming appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`upcoming-appointments`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_appointments",
        },
        () => {
          // Refresh the appointments when any change occurs
          fetchAppointments();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [days, toast]);

  return { appointments, loading, error };
}

// Hook for real-time single appointment updates
export function useRealtimeSingleAppointment(appointmentId?: string) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!appointmentId) {
      setAppointment(null);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentById(appointmentId);
        setAppointment(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching appointment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`appointment-${appointmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_appointments",
          filter: `id=eq.${appointmentId}`,
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;

          if (eventType === "UPDATE") {
            setAppointment(newRecord);
            toast({
              title: "Appointment Updated",
              description: `Appointment "${newRecord.title}" has been updated.`,
            });
          } else if (eventType === "DELETE") {
            setAppointment(null);
            toast({
              title: "Appointment Removed",
              description: "This appointment has been removed.",
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [appointmentId, toast]);

  return { appointment, loading, error };
}

// Hook for real-time appointments by date range
export function useRealtimeAppointmentsByDateRange(
  startDate?: Date,
  endDate?: Date,
) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!startDate || !endDate) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    // Fetch initial data
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("vendor_appointments")
          .select("*")
          .gte("start_time", startDate.toISOString())
          .lte("start_time", endDate.toISOString())
          .order("start_time", { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching appointments by date range:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`date-range-appointments`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendor_appointments",
        },
        () => {
          // Refresh the appointments when any change occurs
          fetchAppointments();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [startDate, endDate, toast]);

  return { appointments, loading, error };
}
