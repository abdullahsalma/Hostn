import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { hostService } from '../../services/host.service';
import type { TermsOfUse } from '../../types';

const FALLBACK_ARTICLES: TermsOfUse['articles'] = [
  { number: 1, title: '\u0627\u0644\u062A\u0639\u0631\u064A\u0641\u0627\u062A', content: '\u064A\u0642\u0635\u062F \u0628\u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0627\u062A\u0641\u0627\u0642\u064A\u0629 \u0627\u0644\u0645\u0639\u0627\u0646\u064A \u0627\u0644\u0645\u0628\u064A\u0646\u0629 \u0623\u0645\u0627\u0645 \u0643\u0644 \u0645\u0646\u0647\u0627: "\u0627\u0644\u0645\u0646\u0635\u0629" \u062A\u0639\u0646\u064A \u0645\u0646\u0635\u0629 \u0647\u0648\u0633\u062A\u0646 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629. "\u0627\u0644\u0645\u0636\u064A\u0641" \u064A\u0639\u0646\u064A \u0627\u0644\u0634\u062E\u0635 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0623\u0648 \u0627\u0644\u0627\u0639\u062A\u0628\u0627\u0631\u064A \u0627\u0644\u0630\u064A \u064A\u0639\u0631\u0636 \u0648\u062D\u062F\u062A\u0647 \u0627\u0644\u0633\u0643\u0646\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0635\u0629. "\u0627\u0644\u0636\u064A\u0641" \u064A\u0639\u0646\u064A \u0627\u0644\u0634\u062E\u0635 \u0627\u0644\u0630\u064A \u064A\u062D\u062C\u0632 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0633\u0643\u0646\u064A\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0635\u0629.' },
  { number: 2, title: '\u0646\u0637\u0627\u0642 \u0627\u0644\u062E\u062F\u0645\u0629', content: '\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0646\u0635\u0629 \u062E\u062F\u0645\u0629 \u0627\u0644\u0648\u0633\u0627\u0637\u0629 \u0628\u064A\u0646 \u0627\u0644\u0645\u0636\u064A\u0641\u064A\u0646 \u0648\u0627\u0644\u0636\u064A\u0648\u0641 \u0644\u062D\u062C\u0632 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0633\u0643\u0646\u064A\u0629 \u0627\u0644\u0645\u0641\u0631\u0648\u0634\u0629. \u0644\u0627 \u062A\u0639\u062F \u0627\u0644\u0645\u0646\u0635\u0629 \u0637\u0631\u0641\u0627\u064B \u0641\u064A \u0639\u0642\u062F \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0628\u064A\u0646 \u0627\u0644\u0645\u0636\u064A\u0641 \u0648\u0627\u0644\u0636\u064A\u0641. \u064A\u0644\u062A\u0632\u0645 \u0627\u0644\u0645\u0636\u064A\u0641 \u0628\u0636\u0645\u0627\u0646 \u062F\u0642\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0642\u062F\u0645\u0629 \u0639\u0646 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0633\u0643\u0646\u064A\u0629.' },
  { number: 3, title: '\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0627\u0644\u0645\u0636\u064A\u0641', content: '\u064A\u0644\u062A\u0632\u0645 \u0627\u0644\u0645\u0636\u064A\u0641 \u0628\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u0631\u0627\u062E\u064A\u0635 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0633\u0643\u0646\u064A\u0629 \u0648\u0641\u0642\u0627\u064B \u0644\u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u0627\u0644\u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u0645\u0639\u0645\u0648\u0644 \u0628\u0647\u0627. \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0627\u0644\u0648\u062D\u062F\u0629 \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0648\u0635\u0641 \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0623\u0646 \u062A\u0643\u0648\u0646 \u0646\u0638\u064A\u0641\u0629 \u0648\u0622\u0645\u0646\u0629 \u0648\u0645\u062C\u0647\u0632\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644.' },
  { number: 4, title: '\u0627\u0644\u062A\u0633\u0639\u064A\u0631 \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062A', content: '\u064A\u062D\u062F\u062F \u0627\u0644\u0645\u0636\u064A\u0641 \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0628\u0634\u0643\u0644 \u0645\u0633\u062A\u0642\u0644. \u062A\u062D\u0635\u0644 \u0627\u0644\u0645\u0646\u0635\u0629 \u0639\u0644\u0649 \u0639\u0645\u0648\u0644\u0629 \u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647\u0627 \u0645\u0646 \u0643\u0644 \u062D\u062C\u0632 \u0645\u0643\u062A\u0645\u0644. \u064A\u062A\u0645 \u062E\u0635\u0645 \u0627\u0644\u0639\u0645\u0648\u0644\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0642\u0628\u0644 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0645\u0628\u0644\u063A \u0644\u0644\u0645\u0636\u064A\u0641. \u062A\u0634\u0645\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u062D\u0633\u0628 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u0639\u0645\u0648\u0644 \u0628\u0647\u0627.' },
  { number: 5, title: '\u0627\u0644\u062D\u062C\u0632 \u0648\u0627\u0644\u0625\u0644\u063A\u0627\u0621', content: '\u064A\u0644\u062A\u0632\u0645 \u0627\u0644\u0645\u0636\u064A\u0641 \u0628\u0642\u0628\u0648\u0644 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0627\u0644\u0645\u0624\u0643\u062F\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0639\u062F\u0645 \u0625\u0644\u063A\u0627\u0626\u0647\u0627 \u0625\u0644\u0627 \u0644\u0644\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0645\u0630\u0643\u0648\u0631\u0629 \u0641\u064A \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0625\u0644\u063A\u0627\u0621. \u0641\u064A \u062D\u0627\u0644\u0629 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0645\u0636\u064A\u0641 \u0644\u0644\u062D\u062C\u0632 \u0628\u062F\u0648\u0646 \u0633\u0628\u0628 \u0645\u0634\u0631\u0648\u0639\u060C \u0642\u062F \u064A\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0639\u0642\u0648\u0628\u0627\u062A \u062A\u0634\u0645\u0644 \u062A\u062E\u0641\u064A\u0636 \u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0623\u0648 \u062A\u0639\u0644\u064A\u0642 \u0627\u0644\u062D\u0633\u0627\u0628.' },
  { number: 6, title: '\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A', content: '\u062A\u062A\u0645 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 \u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0645\u0646 \u0627\u0644\u0645\u0646\u0635\u0629. \u064A\u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u0636\u064A\u0641 \u0648\u0641\u0642\u0627\u064B \u0644\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A \u0627\u0644\u0645\u062D\u062F\u062F \u0641\u064A \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628. \u064A\u062A\u062D\u0645\u0644 \u0627\u0644\u0645\u0636\u064A\u0641 \u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0635\u062D\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0646\u0643\u064A\u0629 \u0627\u0644\u0645\u062F\u062E\u0644\u0629.' },
  { number: 7, title: '\u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0627\u062A', content: '\u064A\u062D\u0642 \u0644\u0644\u0636\u064A\u0648\u0641 \u062A\u0642\u064A\u064A\u0645 \u062A\u062C\u0631\u0628\u062A\u0647\u0645 \u0628\u0639\u062F \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0625\u0642\u0627\u0645\u0629. \u064A\u062D\u0642 \u0644\u0644\u0645\u0636\u064A\u0641 \u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A. \u0644\u0627 \u064A\u062C\u0648\u0632 \u0644\u0644\u0645\u0636\u064A\u0641 \u0637\u0644\u0628 \u0625\u0632\u0627\u0644\u0629 \u062A\u0642\u064A\u064A\u0645 \u0625\u0644\u0627 \u0641\u064A \u062D\u0627\u0644\u0629 \u0645\u062E\u0627\u0644\u0641\u062A\u0647 \u0644\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0645\u0646\u0635\u0629.' },
  { number: 8, title: '\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0648\u0627\u0644\u062A\u0623\u0645\u064A\u0646', content: '\u0627\u0644\u0645\u0636\u064A\u0641 \u0645\u0633\u0624\u0648\u0644 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0639\u0646 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0633\u0643\u0646\u064A\u0629 \u0648\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0636\u064A\u0648\u0641. \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u0631\u0646\u0627\u0645\u062C \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0645\u0636\u064A\u0641 \u0644\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0623\u0636\u0631\u0627\u0631 \u0648\u0641\u0642\u0627\u064B \u0644\u0644\u0634\u0631\u0648\u0637 \u0627\u0644\u0645\u062D\u062F\u062F\u0629. \u0644\u0627 \u062A\u062A\u062D\u0645\u0644 \u0627\u0644\u0645\u0646\u0635\u0629 \u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u0623\u0636\u0631\u0627\u0631 \u0627\u0644\u0646\u0627\u062A\u062C\u0629 \u0639\u0646 \u0625\u0647\u0645\u0627\u0644 \u0627\u0644\u0645\u0636\u064A\u0641.' },
  { number: 9, title: '\u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u0648\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A', content: '\u062A\u0644\u062A\u0632\u0645 \u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u062D\u0645\u0627\u064A\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0636\u064A\u0641\u064A\u0646 \u0648\u0627\u0644\u0636\u064A\u0648\u0641 \u0648\u0641\u0642\u0627\u064B \u0644\u0646\u0638\u0627\u0645 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629. \u064A\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u0636\u064A\u0641 \u0639\u0644\u0649 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u064A\u0627\u0646\u0627\u062A\u0647 \u0644\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0644\u0623\u063A\u0631\u0627\u0636 \u0625\u062D\u0635\u0627\u0626\u064A\u0629.' },
  { number: 10, title: '\u062A\u0639\u0644\u064A\u0642 \u0648\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628', content: '\u064A\u062D\u0642 \u0644\u0644\u0645\u0646\u0635\u0629 \u062A\u0639\u0644\u064A\u0642 \u0623\u0648 \u0625\u0646\u0647\u0627\u0621 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0636\u064A\u0641 \u0641\u064A \u062D\u0627\u0644\u0629 \u0645\u062E\u0627\u0644\u0641\u0629 \u0627\u0644\u0634\u0631\u0648\u0637 \u0623\u0648 \u0627\u0644\u0623\u0646\u0638\u0645\u0629. \u064A\u062D\u0642 \u0644\u0644\u0645\u0636\u064A\u0641 \u0637\u0644\u0628 \u0625\u0644\u063A\u0627\u0621 \u062D\u0633\u0627\u0628\u0647 \u0628\u0639\u062F \u0625\u0643\u0645\u0627\u0644 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629 \u0648\u062A\u0633\u0648\u064A\u0629 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0627\u062A.' },
  { number: 11, title: '\u0627\u0644\u0642\u0627\u0646\u0648\u0646 \u0627\u0644\u0648\u0627\u062C\u0628 \u0627\u0644\u062A\u0637\u0628\u064A\u0642', content: '\u062A\u062E\u0636\u0639 \u0647\u0630\u0647 \u0627\u0644\u0627\u062A\u0641\u0627\u0642\u064A\u0629 \u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629. \u0641\u064A \u062D\u0627\u0644\u0629 \u0646\u0634\u0648\u0621 \u0623\u064A \u0646\u0632\u0627\u0639\u060C \u064A\u062A\u0645 \u0627\u0644\u0644\u062C\u0648\u0621 \u0625\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0642\u0636\u0627\u0626\u064A\u0629 \u0627\u0644\u0645\u062E\u062A\u0635\u0629 \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.' },
];

export default function TermsScreen() {
  const queryClient = useQueryClient();
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery<{ data: TermsOfUse }>({
    queryKey: ['terms'],
    queryFn: hostService.getTerms,
    retry: false,
  });

  const signMutation = useMutation({
    mutationFn: hostService.signTerms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  const terms = data?.data;
  const articles = terms?.articles?.length ? terms.articles : FALLBACK_ARTICLES;
  const isSigned = terms?.signed ?? false;
  const signedDate = terms?.signedDate;

  const toggleArticle = (articleNumber: number) => {
    setExpandedArticle(prev => (prev === articleNumber ? null : articleNumber));
  };

  return (
    <ScreenWrapper>
      <HeaderBar title={'\u0627\u062A\u0641\u0627\u0642\u064A\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645'} showBack />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.errorText}>حدث خطأ في تحميل الشروط والأحكام</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerSection}>
              <Ionicons name="document-text" size={40} color={Colors.primary} />
              <Text style={styles.headerTitle}>{'\u0627\u062A\u0641\u0627\u0642\u064A\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0646\u0635\u0629 \u0647\u0648\u0633\u062A\u0646'}</Text>
              {terms?.version && (
                <Text style={styles.versionText}>{'\u0627\u0644\u0625\u0635\u062F\u0627\u0631: '}{terms.version}</Text>
              )}
            </View>

            {articles.map((article) => (
              <View key={article.number} style={styles.articleContainer}>
                <TouchableOpacity
                  style={styles.articleHeader}
                  onPress={() => toggleArticle(article.number)}
                  activeOpacity={0.7}
                >
                  <View style={styles.articleTitleRow}>
                    <Text style={styles.articleNumber}>{'\u0627\u0644\u0645\u0627\u062F\u0629 '}{article.number}</Text>
                    <Text style={styles.articleTitle}>{': '}{article.title}</Text>
                  </View>
                  <Ionicons
                    name={expandedArticle === article.number ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
                {expandedArticle === article.number && (
                  <View style={styles.articleContent}>
                    <Text style={styles.articleText}>{article.content}</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={styles.bottomBar}>
            {isSigned ? (
              <View style={styles.signedContainer}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                <Text style={styles.signedText}>
                  {'\u062A\u0645 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0628\u062A\u0627\u0631\u064A\u062E '}{signedDate || ''}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.agreeButton}
                onPress={() => signMutation.mutate()}
                disabled={signMutation.isPending}
                activeOpacity={0.8}
              >
                {signMutation.isPending ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.agreeButtonText}>{'\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0627\u0644\u0634\u0631\u0648\u0637'}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.base,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  versionText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  articleContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  articleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    writingDirection: 'rtl',
  },
  articleNumber: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  articleTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  articleContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  articleText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bottomBar: {
    backgroundColor: Colors.white,
    padding: Spacing.base,
    ...Shadows.bottomBar,
  },
  signedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  signedText: {
    ...Typography.bodyBold,
    color: Colors.success,
  },
  agreeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  agreeButtonText: {
    ...Typography.bodyBold,
    color: Colors.textWhite,
  },
});
